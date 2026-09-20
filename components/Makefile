CC := gcc
CXXFLAGS := -std=c++17 -Wall -Wextra -Werror
CFLAGS := -std=c11 -Wall -Wextra -Werror
INCLUDES := -I. -Iblocks

C_SOURCES := assertion.c modal.c iteration/ar.c
CPP_SOURCES := blocks/rend.cpp blocks/ui.cpp blocks/gui.cpp

.PHONY: check c-check cpp-check clean

check: c-check cpp-check

c-check:
	$(CC) $(CFLAGS) $(INCLUDES) -fsyntax-only assertion.c
	$(CC) $(CFLAGS) $(INCLUDES) -fsyntax-only modal.c
	$(CC) $(CFLAGS) $(INCLUDES) -fsyntax-only iteration/ar.c

cpp-check:
	$(CC) -x c++ $(CXXFLAGS) $(INCLUDES) -fsyntax-only blocks/rend.cpp
	$(CC) -x c++ $(CXXFLAGS) $(INCLUDES) -fsyntax-only blocks/ui.cpp
	$(CC) -x c++ $(CXXFLAGS) $(INCLUDES) -fsyntax-only blocks/gui.cpp

clean:
	-del /q *.o blocks\*.o 2>NUL