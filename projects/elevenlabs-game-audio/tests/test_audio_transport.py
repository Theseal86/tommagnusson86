"""Offline regression tests added for the public transport excerpt."""
import contextlib
import io
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from audio_transport import post_with_retry, save_stream


def response(status=200, content_type='audio/mpeg', chunks=None):
    item = Mock()
    item.status_code = status
    item.headers = {'content-type': content_type}
    item.text = 'synthetic response'
    item.json.return_value = {'error': 'synthetic error'}
    item.iter_content.return_value = iter(chunks if chunks is not None else [b'A' * 128])
    return item


class AudioTransportTests(unittest.TestCase):
    def test_success_uses_streaming_and_timeouts(self):
        session = Mock()
        expected = response()
        session.post.return_value = expected
        actual = post_with_retry(session, 'https://example.invalid/audio', {}, {'text': 'test'}, 2)
        self.assertIs(actual, expected)
        self.assertEqual(session.post.call_args.kwargs['timeout'], (20, 900))
        self.assertTrue(session.post.call_args.kwargs['stream'])

    def test_rate_limit_is_retried(self):
        session = Mock()
        expected = response()
        session.post.side_effect = [response(429), expected]
        with patch('audio_transport.time.sleep') as sleep, contextlib.redirect_stderr(io.StringIO()):
            self.assertIs(post_with_retry(session, 'https://example.invalid/audio', {}, {}, 2), expected)
        self.assertEqual(session.post.call_count, 2)
        sleep.assert_called_once_with(2.0)

    def test_retry_limit_is_bounded(self):
        session = Mock()
        session.post.return_value = response(503)
        with patch('audio_transport.time.sleep'), contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaisesRegex(RuntimeError, 'after 3 attempts'):
                post_with_retry(session, 'https://example.invalid/audio', {}, {}, 2)
        self.assertEqual(session.post.call_count, 3)

    def test_non_retryable_error_is_not_repeated(self):
        session = Mock()
        bad = response(400)
        session.post.return_value = bad
        self.assertIs(post_with_retry(session, 'https://example.invalid/audio', {}, {}, 2), bad)
        session.post.assert_called_once()
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(RuntimeError, 'API error 400'):
                save_stream(bad, Path(folder) / 'sample.mp3')

    def test_stream_is_saved_and_partial_file_replaced(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'effects' / 'sample.mp3'
            save_stream(response(chunks=[b'A' * 80, b'', b'B' * 80]), target)
            self.assertEqual(target.read_bytes(), b'A' * 80 + b'B' * 80)
            self.assertFalse(target.with_suffix('.mp3.part').exists())

    def test_invalid_download_does_not_replace_existing_output(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'sample.mp3'
            target.write_bytes(b'previous output')
            for bad in [response(content_type='application/json'), response(chunks=[b'bad'])]:
                with self.subTest(content_type=bad.headers['content-type']):
                    with self.assertRaises(RuntimeError):
                        save_stream(bad, target)
                    self.assertEqual(target.read_bytes(), b'previous output')
                    self.assertFalse(target.with_suffix('.mp3.part').exists())


if __name__ == '__main__':
    unittest.main()
