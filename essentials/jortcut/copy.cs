namespace Essentials.Jortcut
{
    public static class Copy
    {
        public static string GetSelectedText(
            string text,
            int selectionStart,
            int selectionEnd)
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
                return "";

            return text.Substring(start, length);
        }
    }
}
