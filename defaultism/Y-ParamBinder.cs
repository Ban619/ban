using System;
using System.Collections.Generic;

namespace Defaultism
{
    public sealed class BoundParameters
    {
        public List<string> Positional { get; } = new List<string>();
        public Dictionary<string, string?> Named { get; } =
            new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

        public bool Has(string name)
        {
            return Named.ContainsKey(name);
        }

        public string? Get(string name)
        {
            return Named.TryGetValue(name, out string? value)
                ? value
                : null;
        }
    }

    public static class ParameterBinder
    {
        public static BoundParameters Bind(IEnumerable<string> arguments)
        {
            BoundParameters result = new BoundParameters();
            List<string> values = new List<string>(arguments);

            for (int i = 0; i < values.Count; i++)
            {
                string value = values[i];

                if (!value.StartsWith("-", StringComparison.Ordinal) || value == "-")
                {
                    result.Positional.Add(value);
                    continue;
                }

                string name = value.TrimStart('-');
                string? parameterValue = null;

                int equals = name.IndexOf('=');
                if (equals >= 0)
                {
                    parameterValue = name.Substring(equals + 1);
                    name = name.Substring(0, equals);
                }
                else if (i + 1 < values.Count &&
                         !values[i + 1].StartsWith("-", StringComparison.Ordinal))
                {
                    parameterValue = values[++i];
                }

                result.Named[name] = parameterValue;
            }

            return result;
        }
    }
}
