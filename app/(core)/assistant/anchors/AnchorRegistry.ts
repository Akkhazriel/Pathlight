export type ScreenAnchor = {
  x: number;        // экранные координаты (px), origin = левый верх окна
  y: number;
  z?: number;       // опциональная "глубина" в мире (для unproject), по умолчанию 0
  valid?: boolean;  // можно ли использовать якорь прямо сейчас
};

type AnchorProvider = () => ScreenAnchor | null | undefined;

class Registry {
  private map = new Map<string, AnchorProvider>();

  /**
   * Регистрируем СТАТИЧЕСКУЮ точку (снимок). Под капотом оборачиваем в провайдер.
   */
  set(id: string, pt: ScreenAnchor) {
    const snapshot = { ...pt };
    this.map.set(id, () => snapshot);
  }

  /**
   * Регистрируем провайдер (динамические координаты).
   */
  setProvider(id: string, provider: AnchorProvider) {
    this.map.set(id, provider);
  }

  /**
   * Удаляем якорь.
   */
  remove(id: string) {
    this.map.delete(id);
  }

  /**
   * Получаем актуальные координаты (или null, если провайдер вернул невалидное).
   */
  get(id: string): ScreenAnchor | null {
    const p = this.map.get(id);
    if (!p) return null;
    const v = p();
    if (!v || v.valid === false) return null;
    return { x: v.x, y: v.y, z: v.z ?? 0, valid: true };
  }

  has(id: string) {
    return this.map.has(id);
  }

  clear() {
    this.map.clear();
  }
}

export const AnchorRegistry = new Registry();

/**
 * Утилита: регистрируем ref элемента и автоматически меряем его центр в координатах окна.
 * Возвращает disposer для снятия регистрации.
 *
 * Пример:
 * const ref = useRef<View>(null);
 * useEffect(() => registerRefAnchor('nextButton', ref), []);
 */
export function registerRefAnchor(
  id: string,
  ref: { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void },
  opts?: { z?: number; sampleMs?: number }
): () => void {
  const { z = 0, sampleMs = 250 } = opts ?? {};

  let last: ScreenAnchor | null = null;
  let mounted = true;
  let timer: any;

  const measure = () => {
    if (!mounted || !ref?.measureInWindow) return;
    ref.measureInWindow((x, y, w, h) => {
      last = { x: x + w / 2, y: y + h / 2, z, valid: true };
    });
  };

  // провайдер читает последнее измерение
  const provider: AnchorProvider = () => last;

  // первая регистрация
  AnchorRegistry.setProvider(id, provider);

  // периодически обновляем (дешёвый пуллинг; можно заменить на события layout/resize)
  measure();
  timer = setInterval(measure, sampleMs);

  // disposer
  return () => {
    mounted = false;
    clearInterval(timer);
    AnchorRegistry.remove(id);
  };
}