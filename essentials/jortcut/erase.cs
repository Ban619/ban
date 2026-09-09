namespace Essentials.Jortcut
{
    public static class Erase
    {
        public static string Selection(
            string text,
            int selectionStart,
            int selectionEnd,
            out int newCursor)
        {
            int start = selectionStart;
            int end = selectionEnd;

            if (start > end)
            {
                int temp = start;
                start = end;
                end = temp;
            }

            int length = end - start;

            if (length <= 0)
            {
                newCursor = start;
                return text;
            }

            text = text.Remove(start, length);

            newCursor = start;

            return text;
        }

        public static string CharacterBefore(
            string text,
            int cursor,
            out int newCursor)
        {
            if (cursor <= 0)
            {
                newCursor = cursor;
                return text;
            }

            text = text.Remove(cursor - 1, 1);

            newCursor = cursor - 1;

            return text;
        }

        public static string CharacterAt(
            string text,
            int cursor)
        {
            if (cursor >= text.Length)
                return text;

            return text.Remove(cursor, 1);
        }
    }
}
