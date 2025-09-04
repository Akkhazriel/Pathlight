М1 — Навигация и Welcome

Welcome открывается всегда. Если onboarded=true, сразу router.replace('/(tabs)/home').

Кнопка «Начать» теперь жёстко чистит кэш регистрации и заходит на 1-й шаг:

useProfile.getState().clearDraft()

setOnboarded(false)

router.push('/(onboarding)')

М2 — Архитектура онбординга

Не размазывать логику по экрану: сделал реестр шагов (components/onboarding/steps/index.ts).

Каждый шаг — объект { key, Component, validate }.

Оркестратор (app/(onboarding)/index.tsx) просто рендерит steps[current].Component, считает canProceed и двигает прогресс.

Прогресс-бар — на Animated.Value с useRef; предупреждение exhaustive-deps закрыл добавлением зависимостей и стабильной ссылки на значение.

М3 — Стор и типы (фундамент)

Zustand + persist (AsyncStorage): useProfile.

profile: финальные данные пользователя.

draft: черновик онбординга.

currentStep, onboarded, helpers (setDraft, setStep, clearDraft, reset).

Типы:

Profile: displayName, fullName, city/lat/lon, locale, timezone, notifications, privacy, security, preferences, focus.

OnboardingDraft: то же, но «сырьё» по шагам (включая notificationsOptIn, quietHours, morning/eveningTime, addressForm, tone, consentAccepted, cloudSync, aiScope).

Важный нюанс: draft.quietHours сделал Partial<TimeWindow>, чтобы можно было вводить start/end по отдельности; в финализации собираю только если оба есть.

М4 — Реализация шагов

IdentityStep

Полное имя + имя обращения.

Город: ручной ввод + автоопределение через expo-location.

Локаль/таймзона: важно — API expo-localization поменялось → беру getLocales()[0]?.languageTag и getCalendars()[0]?.timeZone (фолбэк на Intl).

Автоподстановка displayName из первого слова fullName.

RhythmStep

«Тихие часы» (HH:MM) с простой маской ввода, keyboardType='number-pad'.

Свитч уведомлений; если включили и пусто — подставляю мягкие дефолты 08:30/20:00.

Валидация: если notificationsOptIn, то хотя бы одно валидное время (HH:MM).

VoiceStep

Обращение «ты/вы» + тон «тепло/лаконично».

На маунте проставляю дефолты (ty, warm) — защита от «битого» кэша.

ConsentStep

Чек обязательного согласия (без него «Далее» не активна).

Синхронизация в облако + анонимная аналитика.

Объём данных для ИИ: summaries или summaries_and_notes; при cloudSync=false принудительно ставлю summaries.

Настройка «защита приложения»: none/biometric (тут только намерение; реальное включение — позже в настройках).

М5 — Валидация и UX-штрихи

Валидаторы в реестре:

identity: displayName.trim().length >= 2

rhythm: !notificationsOptIn || HH:MM(morning) || HH:MM(evening)

voice: addressForm in {'ty','vy'} && tone in {'warm','concise'}

consent: consentAccepted === true

Прогресс-бар плавный (200–250 мс).

Компоненты-чипы мемоизированы (React.memo), обработчики через useCallback, селекторы Zustand, чтобы не дергать лишние рендеры.

A11y: accessibilityRole/State/Label, расширенный hitSlop.

М6 — Ошибки и фиксы (важные)

Алиасы @/… не резолвились → временно относительные импорты, потом добавил babel-plugin-module-resolver и paths в tsconfig.

expo-localization: нет locale/timezone → перешёл на getLocales/getCalendars.

ulid в Hermes: PRNG_DETECT → подключил react-native-get-random-values до импорта ulid (в файле или глобально через polyfills.ts). Добавил safeId() фолбэк.

react-hooks/exhaustive-deps в ProgressBar → useRef для Animated.Value и добавил зависимости.

Типы TimeWindow (см. выше) → Partial в драфте, сборка в финале.

Zustand + shallow: типовая ошибка «ожидалось 0–1 аргументов» при селекторе с shallow. Варианты:

быстрый: убрать второй аргумент;

правильный: createWithEqualityFn из zustand/traditional в сторе.

Дублировался экран шага (2 и 3 показывали одно и то же) → поправил импорты и порядок шагов.

М7 — Финализация онбординга

На последнем шаге мапплю draft → profile.

Генерация id: ulid() (с полифиллом) или safeId() фолбэк.

setProfile(profile), setOnboarded(true).

Навигация: router.replace('/(tabs)/home').

(Опционально) добавил TransitionOverlay (fade + «вспышка светлячка»), чтобы переход ощущался цельным: useTransition.show('/(tabs)/home', 'Добро пожаловать!').

М8 — Сброс и дев-удобства

Быстрый сброс онбординга:

программно: useProfile.getState().reset() и AsyncStorage.removeItem('pathlight.profile');

повесил на кнопку «Начать» автоматический сброс clearDraft() → всегда начинаем с шага 0.

Включил «ручной» сброс через dev-кнопку/консоль, чтобы быстро тестировать.

Итоговое состояние

Готовая пошаговая регистрация (4 шага) с валидацией, плавным прогрессом и локальным хранением (AsyncStorage через Zustand-persist).

Стабильные типы для профиля и черновика, продуманная структура настроек (уведомления, приватность/ИИ, UI-тон, защита).

Флоу UX: минимальное трение, автозаполнение локали/таймзоны, мягкие дефолты, аккуратные ошибки и подсказки.

Багфиксы платформы: alias-резолв, expo-localization API, Hermes + ulid, строгие типы времени.

Что дальше (набросок)

Обвязка под SQLite: миграции + репозиторий profileRepo.upsert/get (черновик заготовлен).

expo-notifications: запрос пермишена, планировщик под morning/eveningTime.

Экран настроек, где можно редактировать всё, что ввели на онбординге (вкл/выкл биометрию).

Дальше — основной функционал (квесты/привычки, «светлячок», дневник) + ИИ-контур (контекст и приватность уже заложены).