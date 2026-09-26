#include "StatsDashboardView.h"

#include <GfxRenderer.h>
#include <I18n.h>

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdio>

#include "MappedInputManager.h"
#include "ReadingDailyStats.h"
#include "components/CompactHeader.h"
#include "components/TouchHeaderBackButton.h"
#include "components/UITheme.h"
#include "fontIds.h"

namespace {
constexpr std::array<StrId, READING_TIME_BUCKET_COUNT> TIME_LABELS = {
    StrId::STR_STATS_MORNING, StrId::STR_STATS_AFTERNOON, StrId::STR_STATS_EVENING, StrId::STR_STATS_NIGHT};
constexpr std::array<const char*, READING_DAY_OF_WEEK_COUNT> DAY_SHORT = {
    "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"};
constexpr std::array<const char*, READING_DAY_OF_WEEK_COUNT> CAL_DAY_SHORT = {
    "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"};

float ppm(const uint32_t pages, const uint32_t seconds) {
  if (seconds < 60) return 0.0f;
  return static_cast<float>(pages) * 60.0f / static_cast<float>(seconds);
}

void centered(const GfxRenderer& renderer, const int font, const int x, const int w, const int y, const char* text,
              const bool bold = false) {
  const auto family = bold ? EpdFontFamily::BOLD : EpdFontFamily::REGULAR;
  const int tw = renderer.getTextWidth(font, text, family);
  renderer.drawText(font, x + (w - tw) / 2, y, text, true, family);
}

void statCell(const GfxRenderer& renderer, const int x, const int y, const int w, const int h, const char* value,
              const char* label) {
  const int valueH = renderer.getLineHeight(UI_12_FONT_ID);
  const int labelH = renderer.getLineHeight(SMALL_FONT_ID);
  const int total = valueH + 1 + labelH;
  const int top = y + std::max(0, (h - total) / 2);
  centered(renderer, UI_12_FONT_ID, x, w, top, value, true);
  centered(renderer, SMALL_FONT_ID, x, w, top + valueH + 1, label);
}

void card(const GfxRenderer& renderer, const int x, const int y, const int w, const int h) {
  renderer.drawRect(x, y, w, h, true);
}

void cardTitle(const GfxRenderer& renderer, const int x, const int y, const int w, const char* text) {
  renderer.drawText(SMALL_FONT_ID, x + 7, y + 5, text, true, EpdFontFamily::BOLD);
}

void compactStatCell(const GfxRenderer& renderer, const int x, const int y, const int w, const int h,
                     const char* value, const char* label) {
  const int valueH = renderer.getLineHeight(UI_10_FONT_ID);
  const int labelH = renderer.getLineHeight(SMALL_FONT_ID);
  const int total = valueH + labelH;
  const int top = y + std::max(0, (h - total) / 2);
  centered(renderer, UI_10_FONT_ID, x, w, top, value, true);
  centered(renderer, SMALL_FONT_ID, x, w, top + valueH, label);
}

void chartTitle(const GfxRenderer& renderer, const int x, const int y, const int w, const char* text) {
  const std::string visible =
      renderer.truncatedText(SMALL_FONT_ID, text, w - 12, EpdFontFamily::BOLD);
  renderer.drawText(SMALL_FONT_ID, x + 6, y + 5, visible.c_str(), true, EpdFontFamily::BOLD);
}

void formatCommaNumber(const uint32_t value, char* buf, const size_t len) {
  if (value < 1000U) {
    snprintf(buf, len, "%lu", static_cast<unsigned long>(value));
  } else if (value < 1000000U) {
    snprintf(buf, len, "%lu,%03lu", static_cast<unsigned long>(value / 1000U),
             static_cast<unsigned long>(value % 1000U));
  } else if (value < 1000000000U) {
    snprintf(buf, len, "%lu,%03lu,%03lu", static_cast<unsigned long>(value / 1000000U),
             static_cast<unsigned long>((value / 1000U) % 1000U), static_cast<unsigned long>(value % 1000U));
  } else {
    snprintf(buf, len, "%lu,%03lu,%03lu,%03lu", static_cast<unsigned long>(value / 1000000000U),
             static_cast<unsigned long>((value / 1000000U) % 1000U),
             static_cast<unsigned long>((value / 1000U) % 1000U), static_cast<unsigned long>(value % 1000U));
  }
}

uint32_t nicePageScale(const uint32_t maximum) {
  if (maximum <= 10U) return 10U;
  if (maximum <= 25U) return 25U;
  if (maximum <= 50U) return 50U;
  if (maximum <= 100U) return 100U;
  return ((maximum + 49U) / 50U) * 50U;
}

uint32_t niceMinuteScale(const uint32_t maximumMinutes) {
  if (maximumMinutes <= 5U) return 5U;
  if (maximumMinutes <= 10U) return 10U;
  if (maximumMinutes <= 30U) return ((maximumMinutes + 4U) / 5U) * 5U;
  if (maximumMinutes <= 60U) return ((maximumMinutes + 9U) / 10U) * 10U;
  return ((maximumMinutes + 29U) / 30U) * 30U;
}

bool historyHasDay(const GlobalReadingStats& stats, const uint32_t dayIndex) {
  if (stats.readingHistoryAnchorDay == 0U || dayIndex > stats.readingHistoryAnchorDay) return false;
  const uint32_t delta = stats.readingHistoryAnchorDay - dayIndex;
  if (delta >= READING_HISTORY_DAYS) return false;
  return (stats.readingHistoryBits[delta / 8U] & static_cast<uint8_t>(1U << (delta % 8U))) != 0;
}

void drawWeeklyPages(const GfxRenderer& renderer, const int x, const int y, const int w, const int h,
                     const std::array<ReadingDailyEntry, ReadingDailyStats::DISPLAY_DAYS>& days) {
  card(renderer, x, y, w, h);
  chartTitle(renderer, x, y, w, "Pages This Week");

  uint32_t maxPages = 0;
  for (const auto& day : days) maxPages = std::max(maxPages, day.pages);
  const uint32_t scaleMax = nicePageScale(maxPages);
  const uint32_t scaleMid = scaleMax / 2U;

  const int labelRight = x + 28;
  const int left = x + 34;
  const int right = x + w - 7;
  const int top = y + 31;
  const int bottom = y + h - 24;
  const int graphW = std::max(1, right - left);
  const int graphH = std::max(1, bottom - top);
  const int slotW = std::max(1, graphW / static_cast<int>(days.size()));
  const int smallH = renderer.getLineHeight(SMALL_FONT_ID);

  char scaleBuf[12];
  snprintf(scaleBuf, sizeof(scaleBuf), "%lu", static_cast<unsigned long>(scaleMax));
  renderer.drawText(SMALL_FONT_ID, labelRight - renderer.getTextWidth(SMALL_FONT_ID, scaleBuf), top - 2, scaleBuf);
  snprintf(scaleBuf, sizeof(scaleBuf), "%lu", static_cast<unsigned long>(scaleMid));
  renderer.drawText(SMALL_FONT_ID, labelRight - renderer.getTextWidth(SMALL_FONT_ID, scaleBuf),
                    top + graphH / 2 - smallH / 2, scaleBuf);
  renderer.drawText(SMALL_FONT_ID, labelRight - renderer.getTextWidth(SMALL_FONT_ID, "0"),
                    bottom - smallH + 2, "0");
  renderer.drawLine(left - 4, top, left - 4, bottom, true);
  renderer.drawLine(left - 4, bottom, right, bottom, true);

  for (size_t i = 0; i < days.size(); ++i) {
    const int bx = left + static_cast<int>(i) * slotW;
    const int barW = std::max(3, slotW / 2);
    const int barH =
        static_cast<int>((static_cast<uint64_t>(graphH) * std::min(days[i].pages, scaleMax)) / scaleMax);
    if (barH > 0) renderer.fillRect(bx + (slotW - barW) / 2, bottom - barH, barW, barH, true);

    ReadingStatsDate date{};
    if (days[i].dayIndex != 0 && readingStatsDateFromDayIndex(days[i].dayIndex, date)) {
      const uint8_t dow = readingStatsDayOfWeekIndex(date);
      centered(renderer, SMALL_FONT_ID, bx, slotW, y + h - 21,
               DAY_SHORT[std::min<size_t>(dow, DAY_SHORT.size() - 1)]);
    }
  }
}

void drawWeeklyReadingTime(const GfxRenderer& renderer, const int x, const int y, const int w, const int h,
                           const std::array<ReadingDailyEntry, ReadingDailyStats::DISPLAY_DAYS>& days) {
  card(renderer, x, y, w, h);

  const char* title = "Reading Time";
  renderer.drawText(SMALL_FONT_ID, x + 6, y + 5, title, true, EpdFontFamily::BOLD);

  char todayDuration[16];
  formatCompactReadingDuration(days.back().readingSeconds, todayDuration, sizeof(todayDuration));
  char todayBuf[24];
  snprintf(todayBuf, sizeof(todayBuf), "Today %s", todayDuration);
  const int todayW = renderer.getTextWidth(SMALL_FONT_ID, todayBuf);
  renderer.drawText(SMALL_FONT_ID, x + w - todayW - 6, y + 5, todayBuf);

  uint32_t maxSeconds = 0;
  for (const auto& day : days) maxSeconds = std::max(maxSeconds, day.readingSeconds);
  const uint32_t maxMinutes = (maxSeconds + 59U) / 60U;
  const uint32_t scaleMaxMinutes = niceMinuteScale(maxMinutes);
  const uint32_t scaleMidMinutes = scaleMaxMinutes / 2U;
  const uint32_t scaleMaxSeconds = scaleMaxMinutes * 60U;

  const int labelRight = x + 28;
  const int left = x + 34;
  const int right = x + w - 10;
  const int top = y + 31;
  const int bottom = y + h - 24;
  const int graphW = std::max(1, right - left);
  const int graphH = std::max(1, bottom - top);
  const int smallH = renderer.getLineHeight(SMALL_FONT_ID);

  char scaleBuf[12];
  snprintf(scaleBuf, sizeof(scaleBuf), "%lu", static_cast<unsigned long>(scaleMaxMinutes));
  renderer.drawText(SMALL_FONT_ID, labelRight - renderer.getTextWidth(SMALL_FONT_ID, scaleBuf), top - 2, scaleBuf);
  snprintf(scaleBuf, sizeof(scaleBuf), "%lu", static_cast<unsigned long>(scaleMidMinutes));
  renderer.drawText(SMALL_FONT_ID, labelRight - renderer.getTextWidth(SMALL_FONT_ID, scaleBuf),
                    top + graphH / 2 - smallH / 2, scaleBuf);
  renderer.drawText(SMALL_FONT_ID, labelRight - renderer.getTextWidth(SMALL_FONT_ID, "0"),
                    bottom - smallH + 2, "0");
  renderer.drawLine(left - 4, top, left - 4, bottom, true);
  renderer.drawLine(left - 4, bottom, right, bottom, true);

  bool havePrev = false;
  int prevX = 0;
  int prevY = 0;
  for (size_t i = 0; i < days.size(); ++i) {
    const int px = left + static_cast<int>((static_cast<long long>(graphW) * i) / (days.size() - 1));
    const uint32_t seconds = std::min(days[i].readingSeconds, scaleMaxSeconds);
    const int py =
        bottom - static_cast<int>((static_cast<uint64_t>(graphH) * seconds) / std::max<uint32_t>(1, scaleMaxSeconds));
    if (havePrev) renderer.drawLine(prevX, prevY, px, py, true);
    renderer.fillRect(px - 1, py - 1, 3, 3, true);
    prevX = px;
    prevY = py;
    havePrev = true;

    ReadingStatsDate date{};
    if (days[i].dayIndex != 0 && readingStatsDateFromDayIndex(days[i].dayIndex, date)) {
      const uint8_t dow = readingStatsDayOfWeekIndex(date);
      const int slotW = std::max(1, graphW / static_cast<int>(days.size()));
      const int labelX = std::clamp(px - slotW / 2, left - 3, right - slotW);
      centered(renderer, SMALL_FONT_ID, labelX, slotW, y + h - 21,
               DAY_SHORT[std::min<size_t>(dow, DAY_SHORT.size() - 1)]);
    }
  }
}

template <size_t N>
void drawHorizontalDistribution(const GfxRenderer& renderer, const int x, const int y, const int w, const int h,
                                const char* title, const std::array<uint32_t, N>& values,
                                const std::array<StrId, N>& labels) {
  card(renderer, x, y, w, h);
  chartTitle(renderer, x, y, w, title);
  uint64_t total = 0;
  uint32_t maxValue = 0;
  for (const auto v : values) {
    total += v;
    maxValue = std::max(maxValue, v);
  }
  const int rowTop = y + 27;
  const int rowH = std::max(14, (h - 32) / static_cast<int>(N));
  int labelW = 0;
  for (size_t i = 0; i < N; ++i) {
    labelW = std::max(labelW, renderer.getTextWidth(SMALL_FONT_ID, I18N.get(labels[i])));
  }
  labelW += 11;
  const int pctW = 34;
  const int barGap = 5;
  const int barX = x + 7 + labelW + barGap;
  const int pctRight = x + w - 7;
  const int barRight = pctRight - pctW - barGap;
  const int barW = std::max(5, barRight - barX);
  const int visualBarW = std::max(5, barW / 2);
  constexpr int visualBarH = 2;
  char buf[12];
  for (size_t i = 0; i < N; ++i) {
    const int yy = rowTop + static_cast<int>(i) * rowH;
    renderer.drawText(SMALL_FONT_ID, x + 7, yy, I18N.get(labels[i]));
    if (maxValue > 0 && values[i] > 0) {
      const int fill = std::max(2, static_cast<int>((static_cast<uint64_t>(visualBarW) * values[i]) / maxValue));
      const int barY = yy + std::max(4, (rowH - visualBarH) / 2);
      renderer.fillRect(barX, barY, fill, visualBarH, true);
    }
    const unsigned pct = total > 0 ? static_cast<unsigned>((values[i] * 100ULL + total / 2ULL) / total) : 0;
    snprintf(buf, sizeof(buf), "%u%%", pct);
    const int pctWidth = renderer.getTextWidth(SMALL_FONT_ID, buf);
    renderer.drawText(SMALL_FONT_ID, pctRight - pctWidth, yy, buf);
  }
}

void drawMonthlyReadingCalendar(const GfxRenderer& renderer, const int x, const int y, const int w, const int h,
                                const GlobalReadingStats& stats, const ReadingStatsDate& todayDate,
                                const bool liveTodayRead) {
  card(renderer, x, y, w, h);
  chartTitle(renderer, x, y, w, "Reading Calendar");
  if (!todayDate.isValid()) return;

  const uint8_t monthDays = daysInMonth(todayDate.year, todayDate.month);
  ReadingStatsDate first{todayDate.year, todayDate.month, 1};
  const uint8_t mondayIndex = readingStatsDayOfWeekIndex(first);
  const uint8_t sundayFirstOffset = static_cast<uint8_t>((mondayIndex + 1U) % 7U);

  uint8_t readCount = 0;
  for (uint8_t day = 1; day <= todayDate.day; ++day) {
    ReadingStatsDate date{todayDate.year, todayDate.month, day};
    bool read = historyHasDay(stats, readingStatsDayIndex(date));
    if (day == todayDate.day && liveTodayRead) read = true;
    if (read) readCount++;
  }

  char summary[20];
  snprintf(summary, sizeof(summary), "%u/%u", static_cast<unsigned>(readCount),
           static_cast<unsigned>(todayDate.day));
  const int summaryW = renderer.getTextWidth(SMALL_FONT_ID, summary);
  renderer.drawText(SMALL_FONT_ID, x + w - summaryW - 6, y + 5, summary);

  const int left = x + 6;
  const int right = x + w - 6;
  const int gridW = std::max(7, right - left);
  const int cellW = std::max(1, gridW / 7);
  const int weekdayY = y + 27;
  for (size_t col = 0; col < CAL_DAY_SHORT.size(); ++col) {
    centered(renderer, SMALL_FONT_ID, left + static_cast<int>(col) * cellW, cellW, weekdayY, CAL_DAY_SHORT[col]);
  }

  const int gridTop = y + 45;
  const int gridBottom = y + h - 5;
  const int rowH = std::max(13, (gridBottom - gridTop) / 6);

  char dayBuf[4];
  for (uint8_t day = 1; day <= monthDays; ++day) {
    const int cell = static_cast<int>(sundayFirstOffset) + static_cast<int>(day) - 1;
    const int col = cell % 7;
    const int row = cell / 7;
    const int cellX = left + col * cellW;
    const int cellY = gridTop + row * rowH;

    snprintf(dayBuf, sizeof(dayBuf), "%u", static_cast<unsigned>(day));
    centered(renderer, SMALL_FONT_ID, cellX, cellW, cellY, dayBuf);

    ReadingStatsDate date{todayDate.year, todayDate.month, day};
    bool read = historyHasDay(stats, readingStatsDayIndex(date));
    if (day == todayDate.day && liveTodayRead) read = true;

    if (read) {
      // Use a compact 5x5 round-ish dot instead of the old 2 px underline.
      // The dot remains visible inside today's outline on the X4 Pro panel.
      const int dotX = cellX + cellW / 2;
      const int dotY = cellY + rowH - 6;
      renderer.fillRect(dotX - 1, dotY - 2, 3, 1, true);
      renderer.fillRect(dotX - 2, dotY - 1, 5, 3, true);
      renderer.fillRect(dotX - 1, dotY + 2, 3, 1, true);
    }
    if (day == todayDate.day) {
      renderer.drawRect(cellX + 1, cellY - 1, std::max(3, cellW - 2), std::max(8, rowH - 1), true);
    }
  }
}

bool finishDate(const BookReadingStats& stats, const ReadingStatsDateTime& today, const uint32_t remainingSeconds,
                ReadingStatsDate& out) {
  if (!today.isValid() || !stats.startDate.isValid() || stats.totalReadingSeconds == 0 || remainingSeconds == 0)
    return false;
  const uint16_t elapsedDays = std::max<uint16_t>(1, readingSpanDaysElapsed(stats.startDate, today.date));
  const uint64_t calendarSeconds =
      (static_cast<uint64_t>(remainingSeconds) * elapsedDays * 86400ULL + stats.totalReadingSeconds / 2ULL) /
      stats.totalReadingSeconds;
  ReadingStatsDateTime dt = today;
  addSecondsToReadingStatsDateTime(dt, static_cast<uint32_t>(std::min<uint64_t>(calendarSeconds, UINT32_MAX)));
  out = dt.date;
  return out.isValid();
}
}  // namespace

void renderX4ProStatsDashboard(GfxRenderer& renderer, const MappedInputManager* mappedInput,
                               const std::string& bookTitle, const BookReadingStats& bookStats,
                               const float progressPercent, const bool hasEstimatedTimeLeft,
                               const uint32_t estimatedTimeLeftSeconds, const uint32_t currentBookPage,
                               const uint32_t currentBookPageCount, const GlobalReadingStats& deviceStats,
                               const uint32_t liveTodayPages, const uint32_t liveTodayReadingSeconds,
                               const bool showButtonHints, const bool showEditButton, const bool showMoreButton) {
  renderer.clearScreen();
  const auto& metrics = UITheme::getInstance().getMetrics();
  if (mappedInput && mappedInput->hasTouchHardware()) {
    TouchHeaderBackButton::drawCompact(renderer, tr(STR_READING_STATS), false, true);
  } else {
    CompactHeader::drawTitle(renderer, tr(STR_READING_STATS), true);
  }

  const int screenW = renderer.getScreenWidth();
  const int screenH = renderer.getScreenHeight();
  const int x = metrics.contentSidePadding;
  const int w = screenW - metrics.contentSidePadding * 2;
  const int footerReserve = showButtonHints ? metrics.buttonHintsHeight + 6 : 2;
  const int contentBottom = screenH - footerReserve;
  int y = CompactHeader::contentTop(metrics);
  constexpr int gap = 5;

  // Proportional layout tuned for the 480x800 X4 Pro but still scales down.
  const int bookH = 168;
  const int todayH = 72;
  const int deviceH = 116;
  const int chartsAvailable = std::max(180, contentBottom - y - bookH - todayH - deviceH - gap * 4);
  const int chartRowH = chartsAvailable / 2;

  // Current book.
  card(renderer, x, y, w, bookH);
  const int titleH = 28;
  const std::string visible =
      renderer.truncatedText(SMALL_FONT_ID, bookTitle.c_str(), w - 18, EpdFontFamily::BOLD);
  centered(renderer, SMALL_FONT_ID, x, w, y + 6, visible.c_str(), true);
  renderer.drawLine(x + 5, y + titleH, x + w - 5, y + titleH, true);

  const int third = w / 3;
  const int rowH = 48;
  char buf[48];
  snprintf(buf, sizeof(buf), "%u", static_cast<unsigned>(bookStats.sessionCount));
  statCell(renderer, x, y + titleH, third, rowH, buf, tr(STR_STATS_SESSIONS_LBL));
  BookReadingStats::formatDuration(bookStats.totalReadingSeconds, buf, sizeof(buf));
  statCell(renderer, x + third, y + titleH, third, rowH, buf, tr(STR_STATS_TIME_LBL));
  if (progressPercent >= 0.0f)
    snprintf(buf, sizeof(buf), "%d%%", static_cast<int>(progressPercent + 0.5f));
  else
    snprintf(buf, sizeof(buf), "-");
  statCell(renderer, x + third * 2, y + titleH, w - third * 2, rowH, buf, tr(STR_STATS_PROGRESS_LBL));

  if (currentBookPage > 0 && currentBookPageCount >= currentBookPage) {
    snprintf(buf, sizeof(buf), "%lu/%lu", static_cast<unsigned long>(currentBookPage),
             static_cast<unsigned long>(currentBookPageCount));
  } else if (currentBookPage > 0) {
    snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(currentBookPage));
  } else {
    snprintf(buf, sizeof(buf), "-");
  }
  constexpr int secondRowNudge = 5;
  statCell(renderer, x, y + titleH + rowH + secondRowNudge, third, rowH, buf, tr(STR_STATS_PAGES_LBL));
  if (!bookStats.isCompleted && hasEstimatedTimeLeft && estimatedTimeLeftSeconds > 0)
    formatCompactReadingDuration(estimatedTimeLeftSeconds, buf, sizeof(buf));
  else if (!bookStats.isCompleted && bookStats.estimatedTimeLeftSeconds > 0)
    formatCompactReadingDuration(bookStats.estimatedTimeLeftSeconds, buf, sizeof(buf));
  else
    snprintf(buf, sizeof(buf), "-");
  statCell(renderer, x + third, y + titleH + rowH + secondRowNudge, third, rowH, buf, tr(STR_TIME_LEFT));
  snprintf(buf, sizeof(buf), "%.1f", ppm(bookStats.totalPagesTurned, bookStats.totalReadingSeconds));
  statCell(renderer, x + third * 2, y + titleH + rowH + secondRowNudge, w - third * 2, rowH, buf,
           tr(STR_STATS_PAGES_PER_MIN));

  ReadingStatsDateTime now{};
  const bool hasNow = getCurrentLocalReadingStatsDateTime(now);
  char startBuf[24];
  char finishBuf[24];
  formatReadingStatsShortDate(bookStats.startDate, startBuf, sizeof(startBuf));
  ReadingStatsDate fd{};
  if (bookStats.isCompleted) {
    fd = bookStats.finishedDate;
  } else if (hasNow) {
    const uint32_t remaining = hasEstimatedTimeLeft ? estimatedTimeLeftSeconds : bookStats.estimatedTimeLeftSeconds;
    finishDate(bookStats, now, remaining, fd);
  }
  formatReadingStatsShortDate(fd, finishBuf, sizeof(finishBuf));
  char leftDate[44];
  char rightDate[44];
  snprintf(leftDate, sizeof(leftDate), "%s %s", tr(STR_STATS_STARTED), startBuf);
  snprintf(rightDate, sizeof(rightDate), "%s %s",
           bookStats.isCompleted ? tr(STR_STATS_FINISHED_DATE) : tr(STR_STATS_EST_FINISH_DATE), finishBuf);
  renderer.drawText(SMALL_FONT_ID, x + 7, y + bookH - 22, leftDate);
  const int rw = renderer.getTextWidth(SMALL_FONT_ID, rightDate);
  renderer.drawText(SMALL_FONT_ID, x + w - rw - 7, y + bookH - 22, rightDate);
  y += bookH + gap;

  // Today + streak share a row.
  const int leftW = (w * 3) / 5;
  const int rightW = w - leftW - gap;
  ReadingDailyStats daily = ReadingDailyStats::load();
  ReadingDailyEntry today{};
  std::array<ReadingDailyEntry, ReadingDailyStats::DISPLAY_DAYS> week{};
  if (hasNow) {
    today = daily.forDate(now.date);
    week = daily.recentSevenDays(now.date);

    // The active reader passes an in-memory preview of the current session.
    // It is added for display only; ReadingDailyStats remains committed only
    // when the reader session itself is committed.
    today.pages = today.pages > UINT32_MAX - liveTodayPages ? UINT32_MAX : today.pages + liveTodayPages;
    today.readingSeconds =
        today.readingSeconds > UINT32_MAX - liveTodayReadingSeconds ? UINT32_MAX
                                                                    : today.readingSeconds + liveTodayReadingSeconds;
    if (!week.empty()) {
      week.back() = today;
    }
  }

  card(renderer, x, y, leftW, todayH);
  cardTitle(renderer, x, y, leftW, "Today");
  const int todayStatY = y + 22;
  const int todayThird = leftW / 3;
  snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(today.pages));
  compactStatCell(renderer, x, todayStatY, todayThird, todayH - 24, buf, "pages");
  BookReadingStats::formatDuration(today.readingSeconds, buf, sizeof(buf));
  compactStatCell(renderer, x + todayThird, todayStatY, todayThird, todayH - 24, buf, "reading");
  snprintf(buf, sizeof(buf), "%.1f", ppm(today.pages, today.readingSeconds));
  compactStatCell(renderer, x + todayThird * 2, todayStatY, leftW - todayThird * 2, todayH - 24, buf, "ppm");

  card(renderer, x + leftW + gap, y, rightW, todayH);
  cardTitle(renderer, x + leftW + gap, y, rightW, "Streak");
  const uint16_t currentStreak = hasNow ? deviceStats.currentReadingStreak(&now.date) : 0;
  snprintf(buf, sizeof(buf), "%u days", static_cast<unsigned>(currentStreak));
  centered(renderer, UI_10_FONT_ID, x + leftW + gap, rightW, y + 24, buf, true);
  snprintf(buf, sizeof(buf), "Best %u", static_cast<unsigned>(deviceStats.displayLongestReadingStreak()));
  centered(renderer, SMALL_FONT_ID, x + leftW + gap, rightW, y + 45, buf);
  y += todayH + gap;

  // Lifetime device card: two rows of three so values stay readable
  // on the physical 480 px-wide X4 Pro screen.
  card(renderer, x, y, w, deviceH);
  cardTitle(renderer, x, y, w, "This Device");
  const int deviceThird = w / 3;
  const int deviceTop = y + 22;
  const int deviceRowH = (deviceH - 24) / 2;

  snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(deviceStats.totalSessions));
  compactStatCell(renderer, x, deviceTop, deviceThird, deviceRowH, buf, "Sessions");
  BookReadingStats::formatDuration(deviceStats.totalReadingSeconds, buf, sizeof(buf));
  compactStatCell(renderer, x + deviceThird, deviceTop, deviceThird, deviceRowH, buf, "Reading");
  snprintf(buf, sizeof(buf), "%.1f", ppm(deviceStats.totalPagesTurned, deviceStats.totalReadingSeconds));
  compactStatCell(renderer, x + deviceThird * 2, deviceTop, w - deviceThird * 2, deviceRowH, buf, "PPM");

  const uint32_t avgSession =
      deviceStats.totalSessions > 0 ? deviceStats.totalReadingSeconds / deviceStats.totalSessions : 0;
  BookReadingStats::formatDuration(avgSession, buf, sizeof(buf));
  compactStatCell(renderer, x, deviceTop + deviceRowH, deviceThird, deviceRowH, buf, "Avg Session");
  formatCommaNumber(deviceStats.totalPagesTurned, buf, sizeof(buf));
  compactStatCell(renderer, x + deviceThird, deviceTop + deviceRowH, deviceThird, deviceRowH, buf, "Pages");
  snprintf(buf, sizeof(buf), "%lu", static_cast<unsigned long>(deviceStats.completedBooks));
  compactStatCell(renderer, x + deviceThird * 2, deviceTop + deviceRowH, w - deviceThird * 2, deviceRowH, buf, "Books");
  y += deviceH + gap;

  // Two chart rows.
  const int half = (w - gap) / 2;
  drawWeeklyPages(renderer, x, y, half, chartRowH, week);
  drawWeeklyReadingTime(renderer, x + half + gap, y, w - half - gap, chartRowH, week);
  y += chartRowH + gap;
  drawHorizontalDistribution(renderer, x, y, half, chartRowH, "Time of Day", deviceStats.timeOfDaySeconds, TIME_LABELS);
  drawMonthlyReadingCalendar(renderer, x + half + gap, y, w - half - gap, chartRowH, deviceStats, now.date,
                             today.readingSeconds > 0);

  if (showButtonHints && mappedInput) {
    const auto labels =
        mappedInput->mapLabels(mappedInput->withBackArrow(tr(STR_BACK)), showEditButton ? tr(STR_EDIT) : "", "",
                               showMoreButton ? tr(STR_MORE) : "");
    GUI.drawButtonHints(renderer, labels.btn1, labels.btn2, labels.btn3, labels.btn4, true);
  }
}
