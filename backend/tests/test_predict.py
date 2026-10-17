"""Inference is deliberately not provided until a retinal model is trained."""
def test_no_prediction_route(client):
    assert client.post('/scans/predict').status_code in (404, 405, 422)
