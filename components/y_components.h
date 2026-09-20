#ifndef Y_COMPONENTS_H
#define Y_COMPONENTS_H

#include <stdbool.h>
#include <stddef.h>

typedef enum {
    Y_ASSERTION_PASS = 0,
    Y_ASSERTION_FAIL = 1,
    Y_ASSERTION_INVALID = 2
} YAssertionStatus;

typedef struct {
    YAssertionStatus status;
    const char *message;
} YAssertionResult;

YAssertionResult y_assert_true(bool condition, const char *message);
YAssertionResult y_assert_equal_text(const char *expected, const char *actual);

typedef enum {
    Y_MODAL_UNKNOWN = 0,
    Y_MODAL_TRY,
    Y_MODAL_CATCH,
    Y_MODAL_FINALLY
} YModalKind;

typedef struct {
    YModalKind kind;
    const char *name;
    size_t name_length;
} YModal;

YModal y_modal_parse(const char *header);
bool y_modal_is_handler(YModalKind kind);

typedef struct {
    int current;
    int limit;
} YAr;

bool y_ar_init(YAr *iterator, int count);
bool y_ar_next(YAr *iterator, int *value);
void y_ar_reset(YAr *iterator);
int y_ar_remaining(const YAr *iterator);

#endif
