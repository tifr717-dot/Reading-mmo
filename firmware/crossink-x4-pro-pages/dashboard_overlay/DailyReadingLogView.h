#pragma once
#include "ReadingStatsUtils.h"
class GfxRenderer;

// Full-screen date-specific log, opened from the existing X4 Pro Stats pages.
// Uses the same monochrome fonts and SD-card history as the dashboard.
void renderX4ProDailyReadingLog(const GfxRenderer& renderer,
                                 const ReadingStatsDate& selectedDate);
