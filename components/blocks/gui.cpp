#include "blocks.hpp"

namespace y::blocks {

Gui::Gui(int width, int height) : surface_(width, height)
{
}

Surface &Gui::surface()
{
    return surface_;
}

void Gui::add(std::unique_ptr<Control> control)
{
    if (control)
        controls_.push_back(std::move(control));
}

bool Gui::dispatch(const Event &event)
{
    for (auto iterator = controls_.rbegin(); iterator != controls_.rend(); ++iterator)
    {
        if ((*iterator)->handle(event))
            return true;
    }
    return false;
}

void Gui::draw()
{
    surface_.clear();
    for (const std::unique_ptr<Control> &control : controls_)
        control->draw(surface_);
}

std::string Gui::render() const
{
    return surface_.ansiOutput();
}

}