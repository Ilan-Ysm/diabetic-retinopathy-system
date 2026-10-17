import type { Metadata } from 'next';
export const metadata: Metadata={title:'О модели | Retinal Fundus Research'};
export default function ModelPage(){
 return <section className="max-w-3xl space-y-6"><h1 className="page-title">Модель искусственного интеллекта</h1>
 <div className="panel space-y-4 p-6"><h2 className="text-xl font-semibold">Этап 2 — обучение и экспериментальная проверка</h2>
 <p>В текущем прототипе модель <strong>не подключена</strong>. Изображения можно загружать, каталогизировать и размечать, однако система не вычисляет степень диабетической ретинопатии.</p>
 <p>На следующем этапе планируется сравнить архитектуры классификации изображений глазного дна (например, ResNet или EfficientNet), провести воспроизводимое разделение датасета и рассчитать метрики accuracy, sensitivity/recall, precision, F1 и ROC-AUC.</p>
 <p className="text-muted">Никакие показатели точности из проекта по МРТ не переносятся на изображения сетчатки.</p></div></section>;
}
