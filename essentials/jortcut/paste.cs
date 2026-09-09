namespace Essentials.Jortcut
{
    public static class Paste
    {
        public static string Insert(
            string text,
            string clipboard,
            int cursor,
            out int newCursor)
        {
            if (string.IsNullOrEmpty(clipboard))
            {
                newCursor = cursor;
                return text;
            }

            text = text.Insert(
                cursor,
                clipboard
            );

            newCursor =
                cursor + clipboard.Length;

            return text;
        }
    }
}
