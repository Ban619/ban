#include "blocks.hpp"

namespace y::blocks {

Control::Control(Rect bounds) : bounds_(bounds)
{
}

Rect Control::bounds() const
{
    return bounds_;
}

void Control::setBounds(Rect bounds)
{
    bounds_ = bounds;
}

bool Control::visible() const
{
    return visible_;
}

void Control::setVisible(bool visible)
{
    visible_ = visible;
}

bool Control::handle(const Event &)
{
    return false;
}

Label::Label(Rect bounds, std::string value) : Control(bounds), value_(std::move(value))
{
}

void Label::setValue(std::string value)
{
    value_ = std::move(value);
}

const std::string &Label::value() const
{
    return value_;
}

void Label::draw(Surface &surface) const
{
    if (visible_)
        surface.text(bounds_.x, bounds_.y, value_, Tone::Text);
}

Button::Button(Rect bounds, std::string caption, std::function<void()> action)
    : Control(bounds), caption_(std::move(caption)), action_(std::move(action))
{
}

void Button::draw(Surface &surface) const
{
    if (!visible_)
        return;

    surface.box(bounds_);
    surface.text(bounds_.x + 1, bounds_.y + bounds_.height / 2, caption_, Tone::Accent);
}

bool Button::handle(const Event &event)
{
    if (!visible_ || event.type != EventType::Click ||
        event.x < bounds_.x || event.y < bounds_.y ||
        event.x >= bounds_.x + bounds_.width ||
        event.y >= bounds_.y + bounds_.height)
        return false;

    if (action_)
        action_();
    return true;
}

TextField::TextField(Rect bounds, std::string value)
    : Control(bounds), value_(std::move(value))
{
}

const std::string &TextField::value() const
{
    return value_;
}

void TextField::setValue(std::string value)
{
    value_ = std::move(value);
}

void TextField::draw(Surface &surface) const
{
    if (!visible_)
        return;

    surface.box(bounds_);
    surface.text(bounds_.x + 1, bounds_.y + 1, value_, Tone::Text);
    if (focused_)
        surface.put(bounds_.x + 1 + static_cast<int>(value_.size()), bounds_.y + 1, '_', Tone::Accent);
}

bool TextField::handle(const Event &event)
{
    if (!visible_)
        return false;

    if (event.type == EventType::Click)
    {
        focused_ = event.x >= bounds_.x && event.y >= bounds_.y &&
            event.x < bounds_.x + bounds_.width &&
            event.y < bounds_.y + bounds_.height;
        return focused_;
    }

    if (!focused_ || event.type != EventType::Key)
        return false;

    if (event.key == '\b')
    {
        if (!value_.empty())
            value_.pop_back();
        return true;
    }

    if (event.key >= 32 && event.key <= 126)
    {
        value_.push_back(event.key);
        return true;
    }

    return false;
}

}