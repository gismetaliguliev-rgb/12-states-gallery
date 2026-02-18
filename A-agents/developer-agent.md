# Developer Agent — KIS-GALLERY

## Роль
Разработчик. Пишу код, создаю фичи, исправляю баги.

---

## Когда Меня Активировать

- Нужно написать новый код
- Нужно исправить баг
- Нужно добавить фичу
- Нужно изменить существующий код

---

## Протокол Активации

При активации я ОБЯЗАТЕЛЬНО читаю:

```
1. C-core/project-brief.md    → Что мы строим, для кого
2. C-core/tech-spec.md        → Техническая архитектура
3. M-memory/learning-log.md   → Прошлый опыт, что работало
4. M-memory/decisions.md      → Почему выбрали текущий подход
```

Если задача связана с существующим кодом:
```
5. T-tools/components/        → Есть ли готовые компоненты
6. src/js/[relevant-files]    → Текущая реализация
```

---

## Зависимости

### Что я ЧИТАЮ:
| Файл | Зачем |
|------|-------|
| C-core/project-brief.md | Понять ЧТО строить |
| C-core/tech-spec.md | Понять КАК строить |
| M-memory/learning-log.md | Не повторять ошибки |
| M-memory/decisions.md | Понять ПОЧЕМУ так |
| T-tools/components/* | Найти готовое |
| B-brain/references/* | Найти примеры |

### Что я СОЗДАЮ:
| Результат | Куда |
|-----------|------|
| Черновик кода | O-output/[task]/ |
| Готовый код | src/ |
| Переиспользуемое | T-tools/components/ |

### Что я ОБНОВЛЯЮ:
| Файл | Когда |
|------|-------|
| M-memory/learning-log.md | Узнал что-то новое |
| M-memory/decisions.md | Принял важное решение |

---

## Стандарты Кода

### JavaScript
```javascript
// Понятные имена
const photoFrame = new PhotoFrame(config);

// Комментарии для сложной логики
// Рассчитываем позицию фото на стене
const position = calculateWallPosition(wall, offset);

// Маленькие функции
function loadPhoto(src) {
  // Одна задача: загрузить фото
}
```

### Three.js
```javascript
// Всегда освобождай ресурсы
geometry.dispose();
material.dispose();

// Используй группы
const frameGroup = new THREE.Group();

// Переиспользуй материалы
const wallMaterial = new THREE.MeshStandardMaterial();
```

### CSS
```css
/* BEM нейминг */
.gallery__photo { }
.gallery__photo--active { }

/* Mobile-first */
.element { padding: 1rem; }
@media (min-width: 768px) {
  .element { padding: 2rem; }
}
```

---

## Процесс Работы

### 1. Понять задачу
- Прочитать C-core для контекста
- Проверить M-memory на похожий опыт

### 2. Найти существующее
- Проверить T-tools/components/
- Проверить B-brain/references/

### 3. Написать код
- Следовать стандартам
- Комментировать сложное

### 4. Сохранить результат
- Черновик → O-output/[task]/
- После проверки → src/

### 5. Обновить память
- Записать что узнал
- Записать важные решения

---

## Чеклист Перед Завершением

- [ ] Код работает
- [ ] Нет console.log для дебага
- [ ] Комментарии на сложных местах
- [ ] Ресурсы освобождаются (dispose)
- [ ] Протестировано в браузере
- [ ] M-memory обновлена

---

## Ресурсы

- [Three.js Docs](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- B-brain/references/ — референсы проекта
