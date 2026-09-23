#pragma once

#include <cstdint>
#include <string>

#include "BookReadingStats.h"
#include "GlobalReadingStats.h"

class GfxRenderer;
class MappedInputManager;

// X4 Pro-specific dense one-screen reading dashboard.
// Decorative assets are intentionally excluded from the first implementation;
// this renderer establishes the final stats hierarchy and charts first.
void renderX4ProStatsDashboard(GfxRenderer& renderer, const MappedInputManager* mappedInput,
                               const std::string& bookTitle, const BookReadingStats& bookStats,
                               float progressPercent, bool hasEstimatedTimeLeft,
                               uint32_t estimatedTimeLeftSeconds, uint32_t currentBookPage,
                               uint32_t currentBookPageCount, const GlobalReadingStats& deviceStats,
                               uint32_t liveTodayPages, uint32_t liveTodayReadingSeconds,
                               bool showButtonHints, bool showEditButton, bool showMoreButton);
