#include "../y_components.h"

bool y_ar_init(YAr *iterator, int count)
{
    if (iterator == NULL || count < 0)
        return false;

    iterator->current = 0;
    iterator->limit = count;
    return true;
}

bool y_ar_next(YAr *iterator, int *value)
{
    if (iterator == NULL || value == NULL || iterator->current >= iterator->limit)
        return false;

    iterator->current++;
    *value = iterator->current;
    return true;
}

void y_ar_reset(YAr *iterator)
{
    if (iterator != NULL)
        iterator->current = 0;
}

int y_ar_remaining(const YAr *iterator)
{
    if (iterator == NULL || iterator->current >= iterator->limit)
        return 0;

    return iterator->limit - iterator->current;
}
