#include "blocks.hpp"

#include <algorithm>

namespace y::blocks {

Surface::Surface(int width, int height) : width_(0), height_(0)
{
    resize(width, height);
}

Size Surface::size() const
{
    return {width_, height_};
}

void Surface::resize(int width, int height)
{
    width_ = std::max(0, width);
    height_ = std::max(0, height);
    cells_.assign(static_cast<size_t>(width_ * height_), Cell{});
}

void Surface::clear(char fill)
{
    for (Cell &cell : cells_)
    {
        cell.value = fill;
        cell.tone = Tone::Background;
    }
}

void Surface::put(int x, int y, char value, Tone tone)
{
    if (x < 0 || y < 0 || x >= width_ || y >= height_)
        return;

    Cell &cell = cells_[static_cast<size_t>(y * width_ + x)];
    cell.value = value;
    cell.tone = tone;
}

void Surface::text(int x, int y, const std::string &value, Tone tone)
{
    for (size_t index = 0; index < value.size(); ++index)
        put(x + static_cast<int>(index), y, value[index], tone);
}

void Surface::box(Rect area, char horizontal, char vertical)
{
    if (area.width < 2 || area.height < 2)
        return;

    for (int x = area.x + 1; x < area.x + area.width - 1; ++x)
    {
        put(x, area.y, horizontal, Tone::Border);
        put(x, area.y + area.height - 1, horizontal, Tone::Border);
    }

    for (int y = area.y + 1; y < area.y + area.height - 1; ++y)
    {
        put(area.x, y, vertical, Tone::Border);
        put(area.x + area.width - 1, y, vertical, Tone::Border);
        for (int x = area.x + 1; x < area.x + area.width - 1; ++x)
            put(x, y, ' ', Tone::Panel);
    }

    put(area.x, area.y, '+', Tone::Accent);
    put(area.x + area.width - 1, area.y, '+', Tone::Accent);
    put(area.x, area.y + area.height - 1, '+', Tone::Accent);
    put(area.x + area.width - 1, area.y + area.height - 1, '+', Tone::Accent);
}

std::string Surface::textOutput() const
{
    std::string output;
    for (int y = 0; y < height_; ++y)
    {
        if (y > 0)
            output.push_back('\n');

        for (int x = 0; x < width_; ++x)
            output.push_back(cells_[static_cast<size_t>(y * width_ + x)].value);
    }
    return output;
}

std::string Surface::ansiOutput() const
{
    auto color = [](Tone tone) -> const char *
    {
        switch (tone)
        {
        case Tone::Panel:
            return "\x1b[38;2;160;185;198m\x1b[48;2;14;20;27m";
        case Tone::Border:
            return "\x1b[38;2;74;112;129m\x1b[48;2;6;9;13m";
        case Tone::Accent:
            return "\x1b[38;2;111;231;239m\x1b[48;2;6;9;13m";
        case Tone::Muted:
            return "\x1b[38;2;104;126;139m\x1b[48;2;6;9;13m";
        case Tone::Text:
            return "\x1b[38;2;216;230;236m\x1b[48;2;6;9;13m";
        case Tone::Background:
        default:
            return "\x1b[38;2;216;230;236m\x1b[48;2;0;0;0m";
        }
    };

    std::string output = "\x1b[H\x1b[2J\x1b[0m";
    Tone previous = Tone::Background;
    output += color(previous);

    for (int y = 0; y < height_; ++y)
    {
        if (y > 0)
            output.push_back('\n');

        for (int x = 0; x < width_; ++x)
        {
            const Cell &cell = cells_[static_cast<size_t>(y * width_ + x)];
            if (cell.tone != previous)
            {
                output += color(cell.tone);
                previous = cell.tone;
            }
            output.push_back(cell.value);
        }
    }

    output += "\x1b[0m";
    return output;
}

}