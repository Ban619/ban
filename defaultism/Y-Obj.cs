using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace Defaultism
{
    public sealed class ShellObject
    {
        public ShellObject(IDictionary<string, object?> properties)
        {
            Properties = new Dictionary<string, object?>(
                properties,
                StringComparer.OrdinalIgnoreCase);
        }

        public IDictionary<string, object?> Properties { get; }

        public object? Get(string name)
        {
            return Properties.TryGetValue(name, out object? value)
                ? value
                : null;
        }

        public string GetText(string name)
        {
            return Convert.ToString(
                Get(name),
                CultureInfo.InvariantCulture) ?? "";
        }

        public ShellObject Select(IEnumerable<string> names)
        {
            Dictionary<string, object?> selected = new Dictionary<string, object?>(
                StringComparer.OrdinalIgnoreCase);

            foreach (string name in names)
            {
                string trimmed = name.Trim();
                if (string.IsNullOrEmpty(trimmed))
                    continue;

                if (Properties.TryGetValue(trimmed, out object? value))
                    selected[trimmed] = value;
            }

            return new ShellObject(selected);
        }

        public IEnumerable<string> PropertyNames()
        {
            return Properties.Keys.OrderBy(name => name, StringComparer.OrdinalIgnoreCase);
        }
    }
}
