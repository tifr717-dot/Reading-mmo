#pragma once

#include <cstdint>
#include "activities/Activity.h"
#include "activities/ScreenTransitionRefresh.h"

// One settings screen: toggle radio, scan/pair, learn the two page buttons,
// and forget saved pairings. Input is only used here, not injected into menus.
class X4PageTurnerSettingsActivity final : public Activity {
 public:
  X4PageTurnerSettingsActivity(GfxRenderer& renderer, MappedInputManager& mappedInput)
      : Activity("X4PageTurnerSettings", renderer, mappedInput) {}
  void onEnter() override;
  void onExit() override;
  void loop() override;
  void render(RenderLock&&) override;
  bool preventAutoSleep() override { return true; }

 private:
  enum class View : uint8_t { Menu, Scan, LearnNext, LearnPrevious };
  View view = View::Menu;
  ScreenTransitionRefresh transition;
  int selection = 0;
  int scanSelection = 0;
  int lastConnectionState = -1;
  int lastRuntimeState = -1;
  uint32_t scanStartedMs = 0;
  const char* notice = "";
  void choose();
  void close();
};
