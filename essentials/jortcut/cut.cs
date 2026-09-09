namespace Essentials.Jortcut
{
    public static class Cut
    {
        public static string Selection(
            string text,
            int selectionStart,
            int selectionEnd,
            out int newCursor,
            out string cutText)
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
                cutText = "";

                return text;
            }

            cutText = text.Substring(start, length);

            text = text.Remove(start, length);

            newCursor = start;

            return text;
        }
    }
}
