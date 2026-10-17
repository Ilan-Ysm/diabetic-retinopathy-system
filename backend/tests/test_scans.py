from io import BytesIO
from PIL import Image

SAMPLE = {'title': 'Fundus-001', 'dataset': 'Open fundus research set', 'ground_truth_grade': 2, 'eye_side': 'left'}

def test_health(client):
    assert client.get('/health').json() == {'status':'ok'}

def test_create_read(client):
    created = client.post('/scans', json=SAMPLE)
    assert created.status_code == 201
    data = created.json()
    assert data['ground_truth_grade'] == 2
    assert data['predicted_grade'] is None
    assert client.get(f"/scans/{data['id']}").json()['title'] == SAMPLE['title']

def test_search_title_and_dataset(client):
    client.post('/scans', json=SAMPLE)
    client.post('/scans', json={**SAMPLE,'title':'Fundus 002','dataset':'APTOS demo metadata'})
    assert len(client.get('/scans',params={'q':'fundus 002'}).json()) == 1
    assert len(client.get('/scans',params={'q':'APTOS'}).json()) == 1

def test_filter_by_grade(client):
    client.post('/scans', json=SAMPLE)
    client.post('/scans', json={**SAMPLE,'title':'Fundus-002','ground_truth_grade':0})
    results = client.get('/scans',params={'grade':0}).json()
    assert len(results) == 1 and results[0]['ground_truth_grade'] == 0

def test_pagination(client):
    for i in range(5):
        client.post('/scans',json={**SAMPLE,'title':f'Fundus-{i}'})
    assert len(client.get('/scans',params={'limit':2}).json()) == 2
    assert len(client.get('/scans',params={'limit':2,'offset':4}).json()) == 1

def test_update(client):
    scan_id = client.post('/scans',json=SAMPLE).json()['id']
    response = client.patch(f'/scans/{scan_id}',json={'ground_truth_grade':3})
    assert response.status_code == 200 and response.json()['ground_truth_grade'] == 3

def test_delete(client):
    scan_id = client.post('/scans',json=SAMPLE).json()['id']
    assert client.delete(f'/scans/{scan_id}').status_code == 204
    assert client.get(f'/scans/{scan_id}').status_code == 404

def test_missing(client):
    assert client.get('/scans/999').status_code == 404

def test_invalid_grade(client):
    assert client.post('/scans',json={**SAMPLE,'ground_truth_grade':5}).status_code == 422

def test_duplicate_file_name(client):
    data = {**SAMPLE,'file_name':'demo.jpg'}
    assert client.post('/scans',json=data).status_code == 201
    assert client.post('/scans',json=data).status_code == 409

def test_upload_does_not_predict(client, tmp_path, monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings,'upload_dir',str(tmp_path))
    image = Image.new('RGB',(48,48),'orange')
    buf = BytesIO()
    image.save(buf,format='PNG')
    result = client.post('/scans/upload',files={'file':('fundus.png',buf.getvalue(),'image/png')})
    assert result.status_code == 201
    info = result.json()
    assert info['ground_truth_grade'] is None
    assert info['predicted_grade'] is None
    assert client.get(f"/scans/{info['id']}/image").status_code == 200

def test_upload_invalid(client):
    response = client.post('/scans/upload',files={'file':('bad.png',b'invalid','image/png')})
    assert response.status_code == 422
