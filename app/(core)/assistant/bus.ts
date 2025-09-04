// Типобезопасная шина событий для ассистента

export type AssistantEvents = {
  'agent:greet': void;
  'agent:listening': void;
  'agent:thinking': void;
  'agent:speaking': { text: string }; // можно стримить кусками — просто эмить часто
  'agent:hideBubble': void;

  'agent:point': { anchorId: string }; // указать на якорь интерфейса
};

type Handler<T> = (payload: T) => void | Promise<void>;
type Unsubscribe = () => void;

export class EventBus<EvtMap extends Record<string, any>> {
  private map = new Map<keyof EvtMap, Set<Handler<any>>>();

  on<K extends keyof EvtMap>(evt: K, h: Handler<EvtMap[K]>): Unsubscribe {
    let set = this.map.get(evt);
    if (!set) {
      set = new Set();
      this.map.set(evt, set);
    }
    set.add(h as Handler<any>);
    return () => this.off(evt, h);
  }

  once<K extends keyof EvtMap>(evt: K, h: Handler<EvtMap[K]>): Unsubscribe {
    const wrap: Handler<EvtMap[K]> = async (p) => {
      try { await h(p); } finally { this.off(evt, wrap); }
    };
    return this.on(evt, wrap);
  }

  off<K extends keyof EvtMap>(evt: K, h: Handler<EvtMap[K]>): void {
    this.map.get(evt)?.delete(h as Handler<any>);
    if (this.map.get(evt)?.size === 0) this.map.delete(evt);
  }

  offAll<K extends keyof EvtMap>(evt?: K): void {
    if (evt) this.map.delete(evt);
    else this.map.clear();
  }

  // emit с вариативным пейлоадом: для void-пейлоада второй аргумент не требуется
  emit<K extends keyof EvtMap>(
    evt: K,
    ...args: EvtMap[K] extends void ? [] : [EvtMap[K]]
  ): void {
    const set = this.map.get(evt);
    if (!set || set.size === 0) return;
    // копия, чтобы безопасно итерироваться, если хендлеры отпишутся/подпишутся
    const list = Array.from(set);
    for (const h of list) {
      try {
        // @ts-expect-error — args корректны по условному типу
        const ret = h(...args);
        // не await-им здесь, чтобы не блокировать JS-поток
        void ret;
      } catch (e) {
        // изоляция ошибок одного хендлера
        // eslint-disable-next-line no-console
        console.warn(`[EventBus emit] handler error for "${String(evt)}":`, e);
      }
    }
  }

  // Вариант, который дождётся всех async-хендлеров (если нужно)
  async emitAsync<K extends keyof EvtMap>(
    evt: K,
    ...args: EvtMap[K] extends void ? [] : [EvtMap[K]]
  ): Promise<void> {
    const set = this.map.get(evt);
    if (!set || set.size === 0) return;
    const list = Array.from(set);
    await Promise.all(
      list.map(async (h) => {
        try {
          // @ts-expect-error — args корректны по условному типу
          await h(...args);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(`[EventBus emitAsync] handler error for "${String(evt)}":`, e);
        }
      })
    );
  }

  listeners<K extends keyof EvtMap>(evt: K): number {
    return this.map.get(evt)?.size ?? 0;
  }
}

export const assistantBus = new EventBus<AssistantEvents>();
