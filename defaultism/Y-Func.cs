using System;
using System.Collections.Generic;

namespace Defaultism
{
    public sealed class ShellFunction
    {
        public ShellFunction(string name, IReadOnlyList<string> parameters, string body)
        {
            Name = name;
            Parameters = parameters;
            Body = body;
        }

        public string Name { get; }
        public IReadOnlyList<string> Parameters { get; }
        public string Body { get; }
    }
}
