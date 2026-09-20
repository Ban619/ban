#include "y_components.h"

#include <string.h>

static YModal unknown_modal(void)
{
    YModal modal;
    modal.kind = Y_MODAL_UNKNOWN;
    modal.name = NULL;
    modal.name_length = 0;
    return modal;
}

YModal y_modal_parse(const char *header)
{
    YModal modal = unknown_modal();
    const char *cursor;

    if (header == NULL)
        return modal;

    if (strncmp(header, "catch:", 6) == 0)
    {
        modal.kind = Y_MODAL_CATCH;
        return modal;
    }

    if (strncmp(header, "finally:", 8) == 0)
    {
        modal.kind = Y_MODAL_FINALLY;
        return modal;
    }

    if (strncmp(header, "try:", 4) == 0)
    {
        modal.kind = Y_MODAL_TRY;
        return modal;
    }

    if (strncmp(header, "try<", 4) != 0)
        return modal;

    cursor = strchr(header + 4, '>');
    if (cursor == NULL || cursor[1] != ':')
        return unknown_modal();

    modal.kind = Y_MODAL_TRY;
    modal.name = header + 4;
    modal.name_length = (size_t)(cursor - (header + 4));
    return modal;
}

bool y_modal_is_handler(YModalKind kind)
{
    return kind == Y_MODAL_CATCH || kind == Y_MODAL_FINALLY;
}
