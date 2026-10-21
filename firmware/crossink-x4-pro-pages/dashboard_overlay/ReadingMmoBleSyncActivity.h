#pragma once

#include <cstdint>
#include <string>

#include "activities/Activity.h"
#include "activities/ScreenTransitionRefresh.h"

class ReadingMmoBleSyncActivity final : public Activity {
 public:
  enum class State : uint8_t { MENU, PICK_DAY, PICK_RANGE_FROM, PICK_RANGE_TO, STARTING_BLE, READY, ERROR };

  ReadingMmoBleSyncActivity(GfxRenderer& renderer, MappedInputManager& mappedInput,
                            bool networkBootReady = false, uint32_t selectionPayload = 0);
  ~ReadingMmoBleSyncActivity() override;

  void onEnter() override;
  void onExit() override;
  void loop() override;
  void render(RenderLock&&) override;
  bool preventAutoSleep() override { return true; }

 private:
  State state_ = State::MENU;
  ScreenTransitionRefresh screenTransitionRefresh_;
  bool networkBootReady_ = false;
  uint32_t selectionPayload_ = 0;
  int menuIndex_ = 0;
  uint16_t dayOffset_ = 0;
  uint16_t rangeFromOffset_ = 6;
  uint16_t rangeToOffset_ = 0;
  uint32_t syncStartedMs_ = 0;
  std::string payload_;
  std::string statusLine_;
  std::string errorMessage_;

  void chooseMenuItem();
  void beginSelectionSync(uint16_t fromDaysAgo, uint16_t toDaysAgo);
  bool buildSelectedPayload(uint32_t packedSelection);
  bool beginBle();
  void adjustCurrentDate(int delta);
  void returnHome();
  void setState(State state);
  void setError(const std::string& error);
};
