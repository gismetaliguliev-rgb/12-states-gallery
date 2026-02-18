# Краткая Справка — KIS-GALLERY

Быстрый справочник по системе ABC-TOM.

---

## Главный Принцип

```
"ABC — это КТО ты. TOM — это ЧТО ты делаешь."
```

| Часть | Назначение | Папка |
|-------|------------|-------|
| **A** - Agents | КТО делает работу | A-agents/ |
| **B** - Brain | ЧТО мы знаем | B-brain/ |
| **C** - Core | КТО мы есть | C-core/ |
| **T** - Tools | КАК мы работаем | T-tools/ |
| **O** - Output | ЧТО создаём | O-output/ |
| **M** - Memory | ЧТО запоминаем | M-memory/ |

---

## Поток Задачи (Кратко)

```
ЗАДАЧА → C-core → M-memory → B-brain → A-agent → T-tools → O-output → M-memory
```

---

## Агенты

| Агент | Когда использовать |
|-------|-------------------|
| **Developer** | Код, фичи, баги |
| **Content** | Фото, тексты, расположение |
| **Reviewer** | Проверка, оптимизация |

---

## Ключевые Файлы

### Всегда Читать Сначала
```
CLAUDE.md           → Точка входа
C-core/project-brief.md → Что строим
M-memory/learning-log.md → Что знаем
```

### При Разработке
```
C-core/tech-spec.md → Архитектура
T-tools/components/ → Готовый код
M-memory/decisions.md → Почему так
```

### При Контенте
```
public/gallery-config.json → Текущие фото
T-tools/workflows/add-photo-workflow.md → Процесс
```

---

## Куда Что Класть

| Тип | Куда |
|-----|------|
| Требования | C-core/ |
| Референсы | B-brain/references/ |
| Инструкции агентов | A-agents/ |
| Готовые компоненты | T-tools/components/ |
| Процессы работы | T-tools/workflows/ |
| Черновики | O-output/[task]/ |
| Готовый код | src/ |
| Конфиги/ассеты | public/ |
| Уроки | M-memory/learning-log.md |
| Решения | M-memory/decisions.md |
| Фидбек | M-memory/feedback.md |

---

## Команды

```bash
npm run dev     # Галерея (localhost:3000)
npm run cms     # Админка (localhost:3001)
npm run build   # Сборка для продакшена
```

---

## Стены Галереи

```
      СЕВЕР (back)
         ┌───┐
  ЗАПАД  │ • │  ВОСТОК
         └───┘
       ЮГ (вход)
```

---

## Правила Системы

1. ✅ Начинай с C-core
2. ✅ Проверяй M-memory
3. ✅ Используй правильного агента
4. ✅ Сохраняй полезное в T-tools
5. ✅ Обновляй M-memory после работы
6. ✅ Сначала O-output, потом src

---

*Подробнее: SYSTEM-LOGIC.md, DEPENDENCIES.md*
