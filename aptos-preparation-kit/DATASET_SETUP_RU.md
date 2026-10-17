# Этап 2 — подготовка APTOS 2019 (Windows + PyCharm + Docker)

Этот набор ДОПОЛНЯЕТ уже работающий проект. Он не заменяет `docker-compose.yml`, `backend` или `.env` целиком. Не удаляйте базы/тома Docker.

## 1. Скачайте данные только с Kaggle

Источник: https://www.kaggle.com/competitions/APTOS2019-blindness-detection/data

Войдите в аккаунт, прочитайте и примите правила соревнования, если доступны, скачайте данные. Для данного этапа нужны **только** `train.csv` и папка `train_images` с оригинальными PNG. `test.csv` не содержит подтверждённых меток и не подходит для расчёта качества модели.

Внимание: набор крупный, загрузка может требовать несколько гигабайт свободного места и времени. Не загружайте данные Kaggle в GitHub и не публикуйте архивы снимков; учитывайте правила источника.

## 2. Скопируйте 2 файла из этого пакета в корень своего проекта

- `docker-compose.override.yml` -> `diabetic-retinopathy-system/docker-compose.override.yml` (рядом с основным `docker-compose.yml`)
- `backend/scripts/prepare_aptos.py` -> `diabetic-retinopathy-system/backend/scripts/prepare_aptos.py`

`docker-compose.override.yml` добавляет монтирование `./data` в контейнер backend и не удаляет существующий том с загруженными снимками.

## 3. Разложите датасет в корне проекта

```
diabetic-retinopathy-system/
  .env                        # не заменяйте и никому не отправляйте
  docker-compose.yml
  docker-compose.override.yml
  backend/
    scripts/
      prepare_aptos.py
  data/
    aptos2019/
      train.csv
      train_images/
        000c1434d8d7.png
        ...
```

Обратите внимание: иногда после распаковки образуется лишняя вложенная папка `train_images/train_images`. Убедитесь, что PNG лежат непосредственно в `data/aptos2019/train_images`.

## 4. Перезапустите контейнер backend с новым кодом и монтированием

В терминале PyCharm, в корне проекта, когда Docker Desktop запущен:

```powershell
docker compose up -d --build
```

Ваши ранее созданные записи и пользовательский `.env` сохранятся (не используйте `docker compose down -v`).

## 5. Запустите проверку и разделение датасета

```powershell
docker compose exec backend python -m scripts.prepare_aptos
```

При успехе будут созданы:
- `data/aptos2019/splits/train.csv` (около 70%)
- `data/aptos2019/splits/val.csv` (около 15%)
- `data/aptos2019/splits/test.csv` (около 15%)
- `data/aptos2019/splits/split_report.json` (сводка распределения классов)

Для проверки целостности **всех** изображений (может занять заметное время):

```powershell
docker compose exec backend python -m scripts.prepare_aptos --verify-images
```

## 6. Ограничения исследовательской оценки

- Это **стратифицированное разделение по изображениям**, с воспроизводимым `seed=42` и неизменной тестовой выборкой для итоговой оценки.
- В исходном `train.csv` нет идентификаторов пациентов: мы не можем гарантировать независимость пациентов между подвыборками. При появлении patient ID разделение нужно делать по пациентам.
- Не подбирайте модель по тестовой выборке; для выбора эпох/параметров используйте `val.csv`.
- Таблицы `train.csv`, `val.csv`, `test.csv`, содержащие ID снимков из источника, тоже оставьте локально и не загружайте в публичный репозиторий.
- Метки датасета служат для учебного исследования, а не для медицинских заключений.

## Что дальше

Следующий этап: обучение простой базовой модели на `train.csv`, выбор лучшего чекпойнта по `val.csv`, однократная оценка на `test.csv`, документирование accuracy, macro-F1, sensitivity/recall по классам и quadratic weighted kappa. После этого — экспорт и отдельная интеграция с FastAPI.

## Защита данных в Git

Добавьте в конец существующего `.gitignore` строку:

```gitignore
data/
```

Не нужно заменять `.gitignore` целиком. Папка `data/` останется только на вашем компьютере.
