#ifndef Y_BLOCKS_HPP
#define Y_BLOCKS_HPP

#include <functional>
#include <memory>
#include <string>
#include <utility>
#include <vector>

namespace y::blocks {

struct Size {
    int width;
    int height;
};

struct Rect {
    int x;
    int y;
    int width;
    int height;
};

enum class Tone {
    Background,
    Panel,
    Border,
    Text,
    Accent,
    Muted
};

struct Cell {
    char value = ' ';
    Tone tone = Tone::Background;
};

class Surface {
public:
    Surface(int width, int height);

    Size size() const;
    void resize(int width, int height);
    void clear(char fill = ' ');
    void put(int x, int y, char value, Tone tone = Tone::Text);
    void text(int x, int y, const std::string &value, Tone tone = Tone::Text);
    void box(Rect area, char horizontal = '-', char vertical = '|');
    std::string textOutput() const;
    std::string ansiOutput() const;

private:
    int width_;
    int height_;
    std::vector<Cell> cells_;
};

enum class EventType {
    Key,
    Click,
    Submit,
    Quit
};

struct Event {
    EventType type;
    char key = '\0';
    int x = 0;
    int y = 0;
    std::string value;
};

class Control {
public:
    explicit Control(Rect bounds);
    virtual ~Control() = default;

    Rect bounds() const;
    void setBounds(Rect bounds);
    bool visible() const;
    void setVisible(bool visible);
    virtual void draw(Surface &surface) const = 0;
    virtual bool handle(const Event &event);

protected:
    Rect bounds_;
    bool visible_ = true;
};

class Label final : public Control {
public:
    Label(Rect bounds, std::string value);
    void setValue(std::string value);
    const std::string &value() const;
    void draw(Surface &surface) const override;

private:
    std::string value_;
};

class Button final : public Control {
public:
    Button(Rect bounds, std::string caption, std::function<void()> action);
    void draw(Surface &surface) const override;
    bool handle(const Event &event) override;

private:
    std::string caption_;
    std::function<void()> action_;
};

class TextField final : public Control {
public:
    TextField(Rect bounds, std::string value = {});
    const std::string &value() const;
    void setValue(std::string value);
    void draw(Surface &surface) const override;
    bool handle(const Event &event) override;

private:
    std::string value_;
    bool focused_ = false;
};

class Gui {
public:
    Gui(int width, int height);

    Surface &surface();
    void add(std::unique_ptr<Control> control);
    bool dispatch(const Event &event);
    void draw();
    std::string render() const;

private:
    Surface surface_;
    std::vector<std::unique_ptr<Control>> controls_;
};

}

#endif