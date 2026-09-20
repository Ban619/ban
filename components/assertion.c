#include "y_components.h"

#include <string.h>

YAssertionResult y_assert_true(bool condition, const char *message)
{
    YAssertionResult result;

    result.status = condition ? Y_ASSERTION_PASS : Y_ASSERTION_FAIL;
    result.message = message == NULL ? "assertion failed" : message;
    return result;
}

YAssertionResult y_assert_equal_text(const char *expected, const char *actual)
{
    YAssertionResult result;

    if (expected == NULL || actual == NULL)
    {
        result.status = Y_ASSERTION_INVALID;
        result.message = "assertion values cannot be null";
        return result;
    }

    result.status = strcmp(expected, actual) == 0
        ? Y_ASSERTION_PASS
        : Y_ASSERTION_FAIL;
    result.message = result.status == Y_ASSERTION_PASS
        ? "assertion passed"
        : "assertion values are different";
    return result;
}
