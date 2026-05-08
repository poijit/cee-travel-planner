# Add a `DealerPlayable` Interface to the Dealer Hierarchy

You already started this — adding `implements DealerPlayable` to `Dealer.java`. This approach **keeps your existing inheritance** (`EasyDealer`, `MediumDealer`, `HardDealer` all stay), and simply **extracts an interface** from the `Dealer` class so that `GameLogic` can program to the interface instead of the concrete class.

This is the classic **"program to an interface, not an implementation"** OOP principle.

## Why This Is Useful

- `GameLogic` currently declares its field as `private Dealer dealer;`. After this change it will use `private DealerPlayable dealer;`, meaning it only depends on the **contract**, not the specific class.
- If you ever want to add a new kind of dealer (e.g. a test/mock dealer, or a network-controlled dealer), you just implement `DealerPlayable` — no need to extend `Dealer`.
- It demonstrates a clean, real-world use of a Java `interface`.

## Proposed Changes

### `logic.player` Package

#### [NEW] [DealerPlayable.java](file:///C:/Users/ComEcc/Documents/cp-project-2025-2-highonprogmeth-main/src/main/java/logic/player/DealerPlayable.java)

Create the interface that captures the public contract of a dealer:

```java
package logic.player;

import logic.card.Card;
import logic.card.Deck;
import java.util.ArrayList;

public interface DealerPlayable {
    boolean shouldHit();
    void setDeck(Deck deck);
    int getScore();
    void clear();
    void addCard(Card card);
    ArrayList<Card> getCards();
}
```

These are exactly the methods that `GameLogic` and `GameController` already call on the dealer.

#### [MODIFY] [Dealer.java](file:///C:/Users/ComEcc/Documents/cp-project-2025-2-highonprogmeth-main/src/main/java/logic/player/Dealer.java)

You already added `implements DealerPlayable` — no other changes needed. `Dealer` already provides all the methods the interface requires (via `BasePlayer` + its own methods).

---

### `logic` Package

#### [MODIFY] [GameLogic.java](file:///C:/Users/ComEcc/Documents/cp-project-2025-2-highonprogmeth-main/src/main/java/logic/GameLogic.java)

Change the `dealer` field and related getter/setter from `Dealer` to `DealerPlayable`:

```diff
-    private Dealer dealer;
+    private DealerPlayable dealer;
```

```diff
-    public Dealer getDealer() {
+    public DealerPlayable getDealer() {
```

```diff
-    public void setDealer(Dealer dealer) {
+    public void setDealer(DealerPlayable dealer) {
```

The `isBlackjack(BasePlayer)` and `is7(BasePlayer)` methods currently take `BasePlayer`. Since `DealerPlayable` is an interface (not extending `BasePlayer`), the calls `isBlackjack(dealer)` / `is7(dealer)` still work because the actual runtime object is a `Dealer` (which **is** a `BasePlayer`). However, to be fully type-safe against the interface, we should add overloads or change these methods to accept `DealerPlayable`:

```diff
-    public boolean isBlackjack(BasePlayer player) {
+    public boolean isBlackjack(DealerPlayable player) {
         return player.getCards().size() == 2 && player.getScore() == 21;
     }

-    public boolean is7(BasePlayer player) {
+    public boolean is7(DealerPlayable player) {
         return player.getCards().size() >= 7 && player.getScore() <= 21;
     }
```

We also need a second overload for `Player` calls (or use a shared super-type). The simplest approach: keep the `BasePlayer` versions and **add** `DealerPlayable` overloads:

```java
public boolean isBlackjack(BasePlayer player) {
    return player.getCards().size() == 2 && player.getScore() == 21;
}
public boolean isBlackjack(DealerPlayable player) {
    return player.getCards().size() == 2 && player.getScore() == 21;
}

public boolean is7(BasePlayer player) {
    return player.getCards().size() >= 7 && player.getScore() <= 21;
}
public boolean is7(DealerPlayable player) {
    return player.getCards().size() >= 7 && player.getScore() <= 21;
}
```

---

### `gui` Package

#### [MODIFY] [GameController.java](file:///C:/Users/ComEcc/Documents/cp-project-2025-2-highonprogmeth-main/src/main/java/gui/GameController.java)

Update any references to `getDealer()` to work with `DealerPlayable`. The existing calls (`getDealer().getCards()`, etc.) will all still compile because `DealerPlayable` declares `getCards()`.

No actual code changes needed here since `GameController` only calls methods that are in the interface.

## Summary of Files Changed

| File | Action | What |
|---|---|---|
| `DealerPlayable.java` | **NEW** | Interface with 6 methods |
| `Dealer.java` | Already done | `implements DealerPlayable` |
| `GameLogic.java` | **MODIFY** | Field type `Dealer` → `DealerPlayable`, add overloaded methods |

> [!IMPORTANT]
> `EasyDealer`, `MediumDealer`, `HardDealer` are **NOT changed or deleted**. They remain as-is.

## Verification Plan

### Automated Tests
- Run `./gradlew build` to confirm compilation
- Start the app and play a round on each difficulty to verify behavior is unchanged
