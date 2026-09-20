using System;
using System.Collections.Generic;
using System.IO;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using Essentials.Configuration;
using Essentials.Commands;

namespace Defaultism
{
    public static class Com
    {
        private static readonly object ExecutionLock = new object();

        private sealed class ScriptLine
        {
            public ScriptLine(string text, int indentation)
            {
                Text = text;
                Indentation = indentation;
            }

            public string Text { get; }
            public int Indentation { get; }
        }

        public static int ExecuteScript(IEnumerable<string> sourceLines)
        {
            List<ScriptLine> lines = sourceLines
                .Where(line => !string.IsNullOrWhiteSpace(line) &&
                               !line.TrimStart().StartsWith("#", StringComparison.Ordinal))
                .Select(line => new ScriptLine(
                    line.Trim(),
                    line.TakeWhile(character => character == ' ' || character == '\t').Count()))
                .ToList();

            return ExecuteScriptRange(lines, 0, lines.Count);
        }

        private static int ExecuteScriptRange(List<ScriptLine> lines, int start, int end)
        {
            int exitCode = 0;
            int index = start;

            while (index < end)
            {
                if (lines[index].Text == ";")
                {
                    index++;
                    continue;
                }

                if (IsColonHeader(lines[index].Text))
                {
                    (int blockExitCode, int nextIndex) = ExecuteScriptBlock(lines, index, end);
                    exitCode = blockExitCode;
                    index = nextIndex;
                    continue;
                }

                exitCode = Execute(lines[index].Text);
                index++;
            }

            return exitCode;
        }

        private static (int exitCode, int nextIndex) ExecuteScriptBlock(
            List<ScriptLine> lines,
            int headerIndex,
            int end)
        {
            ScriptLine header = lines[headerIndex];
            int blockEnd = FindScriptBlockEnd(lines, headerIndex, end);
            string text = header.Text;

            Match tryMatch = Regex.Match(
                text,
                @"^try(?:<(?<name>[^>]*)>)?:$",
                RegexOptions.IgnoreCase);
            if (tryMatch.Success)
            {
                int catchIndex = FindScriptHandler(lines, headerIndex + 1, blockEnd, "catch:");
                int finallyIndex = FindScriptHandler(lines, headerIndex + 1, blockEnd, "finally:");
                int firstHandler = catchIndex >= 0 ? catchIndex : finallyIndex;
                int tryExitCode = ExecuteScriptRange(lines, headerIndex + 1, firstHandler >= 0 ? firstHandler : blockEnd);

                if (tryMatch.Groups["name"].Success)
                    ShellState.Set(tryMatch.Groups["name"].Value, tryExitCode.ToString());

                if (tryExitCode != 0 && catchIndex >= 0)
                {
                    int catchEnd = finallyIndex >= 0 ? finallyIndex : blockEnd;
                    tryExitCode = ExecuteScriptRange(lines, catchIndex + 1, catchEnd);
                }

                if (finallyIndex >= 0)
                    ExecuteScriptRange(lines, finallyIndex + 1, blockEnd);

                return (tryExitCode, blockEnd);
            }

            Match paraMatch = Regex.Match(
                text,
                @"^para<(?<name>[A-Za-z_][A-Za-z0-9_]*)<(?<count>\d+)>>\s*:$",
                RegexOptions.IgnoreCase);
            if (paraMatch.Success && int.TryParse(paraMatch.Groups["count"].Value, out int count))
            {
                int exitCode = 0;
                for (int iteration = 1; iteration <= count; iteration++)
                {
                    ShellState.Set(paraMatch.Groups["name"].Value, iteration.ToString());
                    exitCode = ExecuteScriptRange(lines, headerIndex + 1, blockEnd);
                }

                return (exitCode, blockEnd);
            }

            if (text.StartsWith("kung ", StringComparison.OrdinalIgnoreCase) && text.EndsWith(":", StringComparison.Ordinal))
            {
                bool conditionMet = EvaluateCondition(ExpandVariables(text.Substring(5, text.Length - 6)));
                int exitCode = conditionMet
                    ? ExecuteScriptRange(lines, headerIndex + 1, blockEnd)
                    : 0;
                int nextIndex = blockEnd;

                if (nextIndex < end && lines[nextIndex].Text.Equals("kungdili:", StringComparison.OrdinalIgnoreCase))
                {
                    int elseEnd = FindScriptBlockEnd(lines, nextIndex, end);
                    if (!conditionMet)
                        exitCode = ExecuteScriptRange(lines, nextIndex + 1, elseEnd);
                    nextIndex = elseEnd;
                }

                return (exitCode, nextIndex);
            }

            if (text.StartsWith("samtang ", StringComparison.OrdinalIgnoreCase) && text.EndsWith(":", StringComparison.Ordinal))
            {
                string condition = ExpandVariables(text.Substring(8, text.Length - 9));
                int exitCode = 0;
                while (EvaluateCondition(condition))
                    exitCode = ExecuteScriptRange(lines, headerIndex + 1, blockEnd);

                return (exitCode, blockEnd);
            }

            return (Execute(text), blockEnd);
        }

        private static int FindScriptBlockEnd(List<ScriptLine> lines, int headerIndex, int end)
        {
            int indentation = lines[headerIndex].Indentation;
            for (int index = headerIndex + 1; index < end; index++)
            {
                if (lines[index].Text == ";")
                    continue;

                if (lines[index].Indentation <= indentation)
                    return index;
            }

            return end;
        }

        private static int FindScriptHandler(
            List<ScriptLine> lines,
            int start,
            int end,
            string handler)
        {
            for (int index = start; index < end; index++)
            {
                if (lines[index].Text.Equals(handler, StringComparison.OrdinalIgnoreCase))
                    return index;
            }

            return -1;
        }

        private static bool IsColonHeader(string text)
        {
            return text.EndsWith(":", StringComparison.Ordinal) &&
                (text.StartsWith("try", StringComparison.OrdinalIgnoreCase) ||
                 text.StartsWith("kung ", StringComparison.OrdinalIgnoreCase) ||
                 text.Equals("kungdili:", StringComparison.OrdinalIgnoreCase) ||
                 text.StartsWith("samtang ", StringComparison.OrdinalIgnoreCase) ||
                 text.StartsWith("para<", StringComparison.OrdinalIgnoreCase));
        }

        public static int Execute(string input)
        {
            ShellOutput.ResetExitCode();

            if (TryExecuteColonException(input, out int structuredExitCode))
                return structuredExitCode;

            int exitCode = 0;

            foreach (string statement in SplitTopLevel(input, ';'))
            {
                bool shouldRun = true;

                foreach ((string command, string? operatorText) in SplitConditionals(statement))
                {
                    if (shouldRun)
                        exitCode = ExecutePipeline(command);

                    ShellState.Set("LASTEXITCODE", exitCode.ToString());
                    ShellState.Set("?", exitCode == 0 ? "True" : "False");

                    shouldRun = operatorText switch
                    {
                        "&&" => exitCode == 0,
                        "||" => exitCode != 0,
                        _ => true
                    };
                }
            }

            return exitCode;
        }

        private static bool TryExecuteColonException(string input, out int exitCode)
        {
            exitCode = 0;
            Match match = Regex.Match(
                input,
                @"^\s*try(?:<(?<name>[^>]*)>)?\s*:\s*(?<try>.*?)\s*;\s*(?:catch\s*:\s*(?<catch>.*?)\s*;\s*)?(?:finally\s*:\s*(?<finally>.*?)\s*;\s*)?$",
                RegexOptions.IgnoreCase | RegexOptions.Singleline);

            if (!match.Success)
                return false;

            exitCode = Execute(match.Groups["try"].Value.Trim());

            if (match.Groups["name"].Success)
                ShellState.Set(match.Groups["name"].Value, exitCode.ToString());

            if (exitCode != 0 && match.Groups["catch"].Success)
                exitCode = Execute(match.Groups["catch"].Value.Trim());

            if (match.Groups["finally"].Success)
                Execute(match.Groups["finally"].Value.Trim());

            return true;
        }

        private static int ExecutePipeline(string input)
        {
            string[] stages = SplitTopLevel(input, '|');

            if (TryExecuteObjectPipeline(stages, out int objectExitCode))
                return objectExitCode;

            string pipelineInput = "";
            int exitCode = 0;

            for (int i = 0; i < stages.Length; i++)
            {
                (string command, string? redirect, bool append) = ExtractRedirection(stages[i]);
                bool captureOutput = redirect != null || i < stages.Length - 1;
                string output = ExecuteCommand(command, pipelineInput, out exitCode, captureOutput);

                if (redirect != null)
                {
                    try
                    {
                        if (append)
                            File.AppendAllText(redirect, output);
                        else
                            File.WriteAllText(redirect, output);
                    }
                    catch (Exception ex)
                    {
                        ShellOutput.Error($"redirect: {ex.Message}");
                        return ShellOutput.LastExitCode;
                    }

                    pipelineInput = "";
                }
                else
                {
                    pipelineInput = output;
                }

                if (exitCode != 0)
                    break;
            }

            if (!string.IsNullOrEmpty(pipelineInput))
                Console.Write(pipelineInput);

            return exitCode;
        }

        private static bool TryExecuteObjectPipeline(
            string[] stages,
            out int exitCode)
        {
            exitCode = 0;
            List<string> sourceParts = Parse(ExpandVariables(stages[0]));

            if (sourceParts.Count == 0)
            {
                return false;
            }

            List<ShellObject> objects;

            if (sourceParts[0].Equals("processes", StringComparison.OrdinalIgnoreCase))
            {
                objects = Process.GetProcesses()
                    .Select(process => new ShellObject(
                        new Dictionary<string, object?>
                        {
                            ["Id"] = process.Id,
                            ["Name"] = process.ProcessName,
                            ["Title"] = process.MainWindowTitle,
                            ["Path"] = TryGetProcessPath(process)
                        }))
                    .ToList();
            }
            else if (sourceParts[0].Equals("get", StringComparison.OrdinalIgnoreCase) &&
                     sourceParts.Count > 1)
            {
                string providerName = sourceParts[1];
                string pattern = sourceParts.Count > 2
                    ? string.Join(" ", sourceParts.Skip(2))
                    : null;

                objects = ShellProvider.Read(providerName, pattern).ToList();
            }
            else
            {
                return false;
            }

            for (int i = 1; i < stages.Length; i++)
            {
                List<string> parts = Parse(ExpandVariables(stages[i]));

                if (parts.Count == 0)
                    continue;

                string command = parts[0];
                List<string> arguments = parts.GetRange(1, parts.Count - 1);
                BoundParameters bound = ParameterBinder.Bind(arguments);

                if (command.Equals("where", StringComparison.OrdinalIgnoreCase))
                {
                    string? property = bound.Get("Property");
                    string? expected = bound.Get("Value");

                    if (property == null)
                    {
                        if (bound.Positional.Count == 1 &&
                            bound.Positional[0].Contains('='))
                        {
                            string[] filter = bound.Positional[0].Split('=', 2);
                            property = filter[0];
                            expected = filter[1];
                        }
                        else if (bound.Positional.Count >= 3 &&
                                 string.Equals(bound.Positional[1], "=", StringComparison.Ordinal))
                        {
                            property = bound.Positional[0];
                            expected = string.Join("=", bound.Positional.Skip(2));
                        }
                    }

                    if (property == null || expected == null)
                    {
                        ShellOutput.Error("where: expected Property=value, Property = Value, or -Property Name -Value Value");
                        exitCode = 1;
                        return true;
                    }

                    objects = objects
                        .Where(item => item.GetText(property).Contains(
                            expected,
                            StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }
                else if (command.Equals("select", StringComparison.OrdinalIgnoreCase))
                {
                    List<string> properties = new List<string>();

                    if (bound.Has("Property"))
                        properties.AddRange(SplitPropertyNames(bound.Get("Property")!));

                    properties.AddRange(SplitPropertyNames(bound.Positional));

                    if (properties.Count == 0)
                    {
                        ShellOutput.Error("select: expected one or more properties");
                        exitCode = 1;
                        return true;
                    }

                    objects = objects
                        .Select(item => item.Select(properties))
                        .ToList();
                }
                else if (command.Equals("sort", StringComparison.OrdinalIgnoreCase))
                {
                    string property = bound.Get("Property") ??
                        (bound.Positional.Count == 0 ? "Name" : bound.Positional[0]);
                    objects = objects
                        .OrderBy(item => item.GetText(property), StringComparer.OrdinalIgnoreCase)
                        .ToList();
                }
                else if (command.Equals("get-member", StringComparison.OrdinalIgnoreCase))
                {
                    foreach (string property in objects
                        .SelectMany(item => item.Properties.Keys)
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .OrderBy(name => name, StringComparer.OrdinalIgnoreCase))
                    {
                        Console.WriteLine(property);
                    }

                    return true;
                }
                else if (command.Equals("format", StringComparison.OrdinalIgnoreCase) &&
                         arguments.Count > 0 &&
                         arguments[0].Equals("table", StringComparison.OrdinalIgnoreCase))
                {
                    WriteTable(objects);
                    return true;
                }
                else
                {
                    ShellOutput.Error($"object pipeline: unsupported command '{command}'");
                    exitCode = 1;
                    return true;
                }
            }

            WriteTable(objects);
            return true;
        }

        private static string TryGetProcessPath(Process process)
        {
            try
            {
                return process.MainModule?.FileName ?? "";
            }
            catch (Exception)
            {
                return "";
            }
        }

        private static void WriteTable(List<ShellObject> objects)
        {
            if (objects.Count == 0)
                return;

            List<string> columns = objects
                .SelectMany(item => item.Properties.Keys)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (columns.Count == 0)
                return;

            int[] widths = new int[columns.Count];
            for (int i = 0; i < columns.Count; i++)
            {
                widths[i] = columns[i].Length;
                foreach (ShellObject item in objects)
                {
                    string value = item.GetText(columns[i]);
                    widths[i] = Math.Max(widths[i], value.Length);
                }
            }

            string header = string.Join("  ", columns.Select((name, i) => name.PadRight(widths[i])));
            Console.WriteLine(header);
            Console.WriteLine(new string('-', header.Length));

            foreach (ShellObject item in objects)
            {
                string row = string.Join("  ", columns.Select((name, i) => item.GetText(name).PadRight(widths[i])));
                Console.WriteLine(row);
            }
        }

        private static List<string> SplitPropertyNames(string? names)
        {
            if (string.IsNullOrWhiteSpace(names))
                return new List<string>();

            return SplitPropertyNames(new[] { names });
        }

        private static List<string> SplitPropertyNames(IEnumerable<string> names)
        {
            List<string> result = new List<string>();

            foreach (string name in names)
            {
                foreach (string part in name.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                {
                    if (!string.IsNullOrWhiteSpace(part))
                        result.Add(part);
                }
            }

            return result;
        }

        private static string ExecuteCommand(
            string input,
            string pipelineInput,
            out int exitCode,
            bool captureOutput = true)
        {
            List<string> rawParts = Parse(input);
            List<string> parts = Parse(ExpandVariables(input));

            if (parts.Count == 0)
            {
                exitCode = 0;
                return "";
            }

            string command = parts[0];
            List<string> arguments = parts.GetRange(1, parts.Count - 1);
            if (rawParts.Count > 0 && TryParseCountLoop(rawParts[0], out string loopVariable, out int loopCount))
            {
                exitCode = HandleCountLoop(loopVariable, loopCount, rawParts.GetRange(1, rawParts.Count - 1));
                return "";
            }

            ShellState.Set("args", string.Join(" ", arguments));
            StringWriter? output = captureOutput ? new StringWriter() : null;
            TextWriter? previous = captureOutput ? Console.Out : null;

            try
            {
                if (output != null)
                    Console.SetOut(output);
                exitCode = ExecuteFunction(command, arguments);

                if (exitCode == -1)
                    exitCode = ExecuteBuiltIn(command, arguments, pipelineInput, input);

                if (exitCode == -1)
                {
                    List<string> options = new List<string>();

                    for (int i = arguments.Count - 1; i >= 0; i--)
                    {
                        if (arguments[i].StartsWith("-", StringComparison.Ordinal))
                        {
                            options.Insert(0, arguments[i]);
                            arguments.RemoveAt(i);
                        }
                    }

                    exitCode = Gamitonon.Execute(command, arguments, options);
                }
            }
            finally
            {
                if (previous != null)
                    Console.SetOut(previous);
            }

            return output?.ToString() ?? "";
        }

        private static bool TryParseCountLoop(string command, out string variableName, out int count)
        {
            Match match = Regex.Match(
                command,
                "^para<(?<variable>[A-Za-z_][A-Za-z0-9_]*)<(?<count>\\d+)>>$",
                RegexOptions.IgnoreCase);

            variableName = match.Groups["variable"].Value;
            count = 0;
            return match.Success && int.TryParse(match.Groups["count"].Value, out count) && count >= 0;
        }

        private static int HandleCountLoop(string variableName, int count, List<string> arguments)
        {
            int openBrace = arguments.FindIndex(argument => argument.Equals("{", StringComparison.OrdinalIgnoreCase));
            if (openBrace < 0)
            {
                ShellOutput.Error("para: expected { body }");
                return 1;
            }

            int closeBrace = FindMatchingBrace(arguments, openBrace);
            if (closeBrace < 0)
            {
                ShellOutput.Error("para: missing closing brace");
                return 1;
            }

            string body = string.Join(" ", arguments.GetRange(openBrace + 1, closeBrace - openBrace - 1));
            int exitCode = 0;

            for (int iteration = 1; iteration <= count; iteration++)
            {
                ShellState.Set(variableName, iteration.ToString());
                int result = Execute(body);
                if (result != 0)
                    exitCode = result;
            }

            return exitCode;
        }

        private static int ExecuteFunction(
            string command,
            List<string> arguments)
        {
            if (!ShellState.TryGetFunction(command, out ShellFunction? function))
                return -1;

            string body = function.Body;

            for (int i = 0; i < function.Parameters.Count; i++)
            {
                string value = i < arguments.Count
                    ? arguments[i]
                    : "";

                body = body.Replace(
                    "$" + function.Parameters[i],
                    value,
                    StringComparison.OrdinalIgnoreCase);
            }

            return Execute(body);
        }

        private static int ExecuteBuiltIn(
            string command,
            List<string> arguments,
            string pipelineInput,
            string rawInput)
        {
            if (command.Equals("help", StringComparison.OrdinalIgnoreCase))
            {
                return HandleHelp(arguments);
            }

            if (command.Equals("format", StringComparison.OrdinalIgnoreCase))
            {
                return HandleFormat(arguments, pipelineInput);
            }

            if (command.Equals("assert", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("susi", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count == 0 || !EvaluateCondition(ExpandVariables(string.Join(" ", arguments))))
                {
                    ShellOutput.Error($"assertion failed: {string.Join(" ", arguments)}");
                    return 1;
                }

                return 0;
            }

            if (command.Equals("kung", StringComparison.OrdinalIgnoreCase))
            {
                return HandleIf(arguments, rawInput);
            }

            if (command.Equals("foreach", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("para", StringComparison.OrdinalIgnoreCase))
            {
                return HandlePara(arguments, rawInput);
            }

            if (command.Equals("samtang", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("while", StringComparison.OrdinalIgnoreCase))
            {
                return HandleWhile(arguments, rawInput);
            }

            if (command.Equals("try", StringComparison.OrdinalIgnoreCase))
            {
                return HandleTryCatch(arguments);
            }

            if (command.Equals("catch", StringComparison.OrdinalIgnoreCase))
            {
                return HandleCatch(arguments);
            }

            if (command.Equals("finally", StringComparison.OrdinalIgnoreCase))
            {
                return HandleFinally(arguments);
            }

            if (command.Equals("function", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("pamaagi", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count < 3)
                {
                    ShellOutput.Error("pamaagi: expected name, parameters, --, and body");
                    return 1;
                }

                int separator = arguments.IndexOf("--");

                if (separator < 1 || separator == arguments.Count - 1)
                {
                    ShellOutput.Error("pamaagi: expected name parameters -- body");
                    return 1;
                }

                ShellState.DefineFunction(
                    arguments[0],
                    arguments.GetRange(1, separator - 1),
                    string.Join(" ", arguments.GetRange(separator + 1, arguments.Count - separator - 1)));
                return 0;
            }

            if (command.Equals("functions", StringComparison.OrdinalIgnoreCase))
            {
                foreach (ShellFunction function in ShellState.Functions.Values)
                    Console.WriteLine(function.Name);

                return 0;
            }

            if (command.Equals("echo", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("write-output", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("write-host", StringComparison.OrdinalIgnoreCase))
            {
                string content = string.Join(" ", arguments);

                if (!string.IsNullOrWhiteSpace(pipelineInput))
                {
                    string inputText = pipelineInput.TrimEnd('\r', '\n');
                    if (string.IsNullOrWhiteSpace(content))
                        Console.WriteLine(inputText);
                    else
                        Console.WriteLine($"{inputText} {content}");
                }
                else if (string.IsNullOrEmpty(content))
                {
                    Console.WriteLine();
                }
                else
                {
                    Console.WriteLine(content);
                }

                return 0;
            }

            if (command.Equals("get-command", StringComparison.OrdinalIgnoreCase))
            {
                foreach (string name in Gamitonon.GetCommandNames())
                    Console.WriteLine(name);

                Console.WriteLine("function");
                Console.WriteLine("functions");
                Console.WriteLine("echo");
                Console.WriteLine("write-output");
                Console.WriteLine("write-host");
                Console.WriteLine("help");
                Console.WriteLine("format");
                Console.WriteLine("assert");
                Console.WriteLine("kung");
                Console.WriteLine("foreach");
                Console.WriteLine("while");
                Console.WriteLine("get-command");
                Console.WriteLine("processes");
                Console.WriteLine("get Env:");
                Console.WriteLine("get Variable:");
                Console.WriteLine("get FileSystem:");
                Console.WriteLine("set-variable");
                Console.WriteLine("remove-variable");
                Console.WriteLine("set-env");
                Console.WriteLine("remove-env");
                Console.WriteLine("listen");
                Console.WriteLine("connect");
                Console.WriteLine("stop-listening");
                Console.WriteLine("select");
                Console.WriteLine("sort");
                Console.WriteLine("get-member");
                Console.WriteLine("format table");
                Console.WriteLine("jobs");
                Console.WriteLine("stop-job");
                Console.WriteLine("wait-job");
                Console.WriteLine("receive");
                Console.WriteLine("start");
                return 0;
            }

            if (command.Equals("env", StringComparison.OrdinalIgnoreCase))
            {
                foreach (System.Collections.DictionaryEntry item in Environment.GetEnvironmentVariables())
                    Console.WriteLine($"{item.Key}={item.Value}");

                return 0;
            }

            if (command.Equals("set-variable", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("butang-baryabol", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("set-env", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("butang-palibot", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count < 2)
                {
                    ShellOutput.Error($"{command}: expected name and value");
                    return 1;
                }

                string provider = command.Equals("set-env", StringComparison.OrdinalIgnoreCase) ||
                    command.Equals("butang-palibot", StringComparison.OrdinalIgnoreCase)
                    ? "Env:"
                    : "Variable:";
                ShellProvider.Set(provider, arguments[0], string.Join(" ", arguments.Skip(1)));
                return 0;
            }

            if (command.Equals("remove-variable", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("kuha-baryabol", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("remove-env", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("kuha-palibot", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count != 1)
                {
                    ShellOutput.Error($"{command}: expected a name");
                    return 1;
                }

                string provider = command.Equals("remove-env", StringComparison.OrdinalIgnoreCase) ||
                    command.Equals("kuha-palibot", StringComparison.OrdinalIgnoreCase)
                    ? "Env:"
                    : "Variable:";
                if (!ShellProvider.Remove(provider, arguments[0]))
                {
                    ShellOutput.Error($"{command}: value was not found");
                    return 1;
                }

                return 0;
            }

            if (command.Equals("import", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("module", StringComparison.OrdinalIgnoreCase) ||
                command.Equals("import-module", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count != 1)
                {
                    ShellOutput.Error("import: expected a module, directory, or wildcard path");
                    return 1;
                }

                try
                {
                    List<string> files = ResolveImportPaths(arguments[0]);
                    if (files.Count == 0)
                    {
                        ShellOutput.Error($"import: no files matched '{arguments[0]}'");
                        return 1;
                    }

                    foreach (string file in files)
                        ExecuteScript(File.ReadLines(file));

                    return 0;
                }
                catch (Exception ex)
                {
                    ShellOutput.Error($"import: {ex.Message}");
                    return 1;
                }
            }

            if (command.Equals("listen", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count != 2 || !int.TryParse(arguments[0], out int port))
                {
                    ShellOutput.Error("listen: expected port and shared token");
                    return 1;
                }

                if (!ShellRemote.Start(port, arguments[1]))
                {
                    ShellOutput.Error("listen: could not start loopback listener");
                    return 1;
                }

                Console.WriteLine($"Listening on 127.0.0.1:{port}");
                return 0;
            }

            if (command.Equals("stop-listening", StringComparison.OrdinalIgnoreCase))
            {
                ShellRemote.Stop();
                Console.WriteLine("Remote listener stopped.");
                return 0;
            }

            if (command.Equals("connect", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count < 3 || !int.TryParse(arguments[0], out int port))
                {
                    ShellOutput.Error("connect: expected port, shared token, and command");
                    return 1;
                }

                try
                {
                    string remoteCommand = string.Join(" ", arguments.GetRange(2, arguments.Count - 2));
                    Console.Write(
                        ShellRemote.Connect(
                            port,
                            arguments[1],
                            remoteCommand));
                    return 0;
                }
                catch (Exception ex)
                {
                    ShellOutput.Error($"connect: {ex.Message}");
                    return 1;
                }
            }

            if (command.Equals("start", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count == 0)
                {
                    ShellOutput.Error("start: missing command");
                    return 1;
                }

                string backgroundCommand = string.Join(" ", arguments);
                ShellJob job = ShellState.StartJob(
                    backgroundCommand,
                    (text, token) => token.IsCancellationRequested
                        ? (1, "job cancelled\n")
                        : RunCaptured(text));
                Console.WriteLine($"[{job.Id}] started");
                return 0;
            }

            if (command.Equals("jobs", StringComparison.OrdinalIgnoreCase))
            {
                foreach (ShellJob job in ShellState.Jobs.Values)
                {
                    string status = job.Task.IsCompleted ? "Completed" : "Running";
                    Console.WriteLine($"[{job.Id}] {status} {job.Command}");
                }

                return 0;
            }

            if (command.Equals("stop-job", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count != 1 || !int.TryParse(arguments[0], out int id) || !ShellState.StopJob(id))
                {
                    ShellOutput.Error("stop-job: expected a running job id");
                    return 1;
                }

                Console.WriteLine($"[{id}] stopping");
                return 0;
            }

            if (command.Equals("wait-job", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count != 1 || !int.TryParse(arguments[0], out int id) ||
                    !ShellState.TryGetJob(id, out ShellJob? job))
                {
                    ShellOutput.Error("wait-job: expected a valid job id");
                    return 1;
                }

                job.Task.Wait();
                Console.WriteLine($"[{id}] completed with exit code {job.ExitCode}");
                return job.ExitCode;
            }

            if (command.Equals("receive", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count != 1 || !int.TryParse(arguments[0], out int id) ||
                    !ShellState.TryGetJob(id, out ShellJob? job))
                {
                    ShellOutput.Error("receive: expected a valid job id");
                    return 1;
                }

                job.Task.Wait();

                if (!string.IsNullOrEmpty(job.Error))
                {
                    ShellOutput.Error($"job {job.Id}: {job.Error}");
                    return 1;
                }

                Console.Write(job.Output);
                return job.ExitCode;
            }

            if (command.Equals("set", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count == 0)
                {
                    foreach (KeyValuePair<string, string> variable in ShellState.Variables)
                        Console.WriteLine($"{variable.Key}={variable.Value}");
                }
                else
                {
                    string value = string.Join(" ", arguments);
                    int separator = value.IndexOf('=');

                    if (separator < 1)
                    {
                        ShellOutput.Error("set: expected name=value");
                        return 1;
                    }

                    ShellState.Set(
                        value.Substring(0, separator),
                        value.Substring(separator + 1));
                }

                return 0;
            }

            if (command.Equals("vars", StringComparison.OrdinalIgnoreCase))
            {
                foreach (KeyValuePair<string, string> variable in ShellState.Variables)
                    Console.WriteLine($"{variable.Key}={variable.Value}");

                return 0;
            }

            if (command.Equals("where", StringComparison.OrdinalIgnoreCase))
            {
                if (arguments.Count == 0)
                {
                    ShellOutput.Error("where: missing search text");
                    return 1;
                }

                foreach (string line in pipelineInput.Split(
                    new[] { "\r\n", "\n" },
                    StringSplitOptions.RemoveEmptyEntries))
                {
                    if (line.Contains(arguments[0], StringComparison.OrdinalIgnoreCase))
                        Console.WriteLine(line);
                }

                return 0;
            }

            return -1;
        }

        private static int HandleHelp(List<string> arguments)
        {
            if (arguments.Count == 0)
            {
                foreach (string name in Gamitonon.GetCommandNames())
                {
                    string resolvedDescription = Gamitonon.TryGetDescription(name, out string foundDescription)
                        ? foundDescription
                        : "command";
                    Console.WriteLine($"{name} - {resolvedDescription}");
                }

                Console.WriteLine("help - Show command help");
                Console.WriteLine("format - Format output as list/table");
                Console.WriteLine("kung - Conditional execution");
                Console.WriteLine("para<<var><count>> { ... } - Repeat a block count times");
                Console.WriteLine("samtang - Loop while a condition is true");
                Console.WriteLine("pamaagi - Define a shell function");
                Console.WriteLine("try: <body> ; catch: <body> ; finally: <body> ; - Handle errors");
                return 0;
            }

            string target = arguments[0];
            if (Gamitonon.TryGetDescription(target, out string description))
            {
                Console.WriteLine($"{target}: {description}");
                return 0;
            }

            if (target.Equals("help", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("help [command] - Show command help");
                return 0;
            }

            if (target.Equals("format", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("format list|table - Render pipeline output as a list or table");
                return 0;
            }

            if (target.Equals("kung", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("kung <condition> { <body> } kungdili { <body> } - Execute a conditional block");
                return 0;
            }

            if (target.Equals("foreach", StringComparison.OrdinalIgnoreCase) ||
                target.Equals("para", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("para<<var><count>> { <body> } - Repeat a block count times");
                Console.WriteLine("Example: para<x<5>> { echo $x }");
                return 0;
            }

            if (target.Equals("samtang", StringComparison.OrdinalIgnoreCase) ||
                target.Equals("while", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("samtang <condition> { <body> } - Loop while a condition is true");
                return 0;
            }

            if (target.Equals("pamaagi", StringComparison.OrdinalIgnoreCase) ||
                target.Equals("function", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("pamaagi <name> <params> -- <body> - Define a shell function");
                return 0;
            }

            if (target.Equals("try", StringComparison.OrdinalIgnoreCase) ||
                target.Equals("catch", StringComparison.OrdinalIgnoreCase) ||
                target.Equals("finally", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("try: <body> ; catch: <body> ; finally: <body> ; - Handle errors");
                return 0;
            }

            Console.WriteLine($"No help found for '{target}'.");
            return 1;
        }

        private static int HandleFormat(List<string> arguments, string pipelineInput)
        {
            if (arguments.Count == 0)
            {
                Console.WriteLine("format: expected list or table");
                return 1;
            }

            string mode = arguments[0];
            if (mode.Equals("table", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(pipelineInput))
                    return 0;

                string[] lines = pipelineInput.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string line in lines)
                    Console.WriteLine(line);
                return 0;
            }

            if (mode.Equals("list", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(pipelineInput))
                    return 0;

                string[] lines = pipelineInput.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string line in lines)
                    Console.WriteLine($"- {line}");
                return 0;
            }

            Console.WriteLine("format: expected list or table");
            return 1;
        }

        private static int HandleTryCatch(List<string> arguments)
        {
            int tryIndex = arguments.FindIndex(arg => arg.Equals("try", StringComparison.OrdinalIgnoreCase));
            if (tryIndex < 0)
            {
                ShellOutput.Error("try: expected try block");
                return 1;
            }

            if (arguments.Any(argument => argument.Equals("{", StringComparison.OrdinalIgnoreCase)))
            {
                ShellOutput.Error("try: use 'try: <body> ; catch: <body> ; finally: <body> ;'");
                return 1;
            }

            if (arguments.Any(argument => argument.Equals("::", StringComparison.OrdinalIgnoreCase)))
            {
                ShellOutput.Error("try: use 'try: <body> ; catch: <body> ; finally: <body> ;'");
                return 1;
            }

            int tryOpen = arguments.FindIndex(arg => arg.Equals("{", StringComparison.OrdinalIgnoreCase));
            if (tryOpen < 0)
            {
                ShellOutput.Error("try: expected { body }");
                return 1;
            }

            int tryClose = FindMatchingBrace(arguments, tryOpen);
            if (tryClose < 0)
            {
                ShellOutput.Error("try: missing closing brace");
                return 1;
            }

            string tryBody = string.Join(" ", arguments.GetRange(tryOpen + 1, tryClose - tryOpen - 1));
            int catchIndex = arguments.FindIndex(arg => arg.Equals("catch", StringComparison.OrdinalIgnoreCase));
            int finallyIndex = arguments.FindIndex(arg => arg.Equals("finally", StringComparison.OrdinalIgnoreCase));

            int exitCode = Execute(tryBody);

            if (exitCode != 0 && catchIndex >= 0)
            {
                int catchOpen = arguments.FindIndex(catchIndex + 1, arg => arg.Equals("{", StringComparison.OrdinalIgnoreCase));
                if (catchOpen >= 0)
                {
                    int catchClose = FindMatchingBrace(arguments, catchOpen);
                    if (catchClose >= 0)
                    {
                        string catchBody = string.Join(" ", arguments.GetRange(catchOpen + 1, catchClose - catchOpen - 1));
                        exitCode = Execute(catchBody);
                    }
                }
            }

            if (finallyIndex >= 0)
            {
                int finallyOpen = arguments.FindIndex(finallyIndex + 1, arg => arg.Equals("{", StringComparison.OrdinalIgnoreCase));
                if (finallyOpen >= 0)
                {
                    int finallyClose = FindMatchingBrace(arguments, finallyOpen);
                    if (finallyClose >= 0)
                    {
                        string finallyBody = string.Join(" ", arguments.GetRange(finallyOpen + 1, finallyClose - finallyOpen - 1));
                        Execute(finallyBody);
                    }
                }
            }

            return exitCode;
        }

        private static int HandleCatch(List<string> arguments)
        {
            return Execute(string.Join(" ", arguments));
        }

        private static int HandleFinally(List<string> arguments)
        {
            return Execute(string.Join(" ", arguments));
        }

        private static int HandleIf(List<string> arguments, string rawInput)
        {
            if (arguments.Count < 2)
            {
                ShellOutput.Error("kung: expected condition and block");
                return 1;
            }

            int openBrace = arguments.FindIndex(arg => arg.Equals("{", StringComparison.OrdinalIgnoreCase));
            if (openBrace < 0)
            {
                ShellOutput.Error("kung: expected { body }");
                return 1;
            }

            int closeBrace = FindMatchingBrace(arguments, openBrace);
            if (closeBrace < 0)
            {
                ShellOutput.Error("kung: missing closing brace");
                return 1;
            }

            string condition = string.Join(" ", arguments.GetRange(0, openBrace));
            string ifBody = string.Join(" ", arguments.GetRange(openBrace + 1, closeBrace - openBrace - 1));

            int elseIndex = -1;
            for (int i = closeBrace + 1; i < arguments.Count; i++)
            {
                if (arguments[i].Equals("kungdili", StringComparison.OrdinalIgnoreCase))
                {
                    elseIndex = i;
                    break;
                }
            }

            if (EvaluateCondition(condition))
            {
                return Execute(ifBody);
            }

            if (elseIndex >= 0)
            {
                int elseOpen = elseIndex + 1;
                while (elseOpen < arguments.Count && !arguments[elseOpen].Equals("{", StringComparison.OrdinalIgnoreCase))
                    elseOpen++;

                if (elseOpen >= arguments.Count)
                    return 0;

                int elseClose = FindMatchingBrace(arguments, elseOpen);
                if (elseClose < 0)
                {
                    ShellOutput.Error("kung: missing closing brace in kungdili block");
                    return 1;
                }

                string elseBody = string.Join(" ", arguments.GetRange(elseOpen + 1, elseClose - elseOpen - 1));
                return Execute(elseBody);
            }

            return 0;
        }

        private static int HandlePara(List<string> arguments, string rawInput)
        {
            if (arguments.Count < 4)
            {
                ShellOutput.Error("para: expected 'sa kada <var> sa <values> { body }'");
                return 1;
            }

            int openBrace = arguments.FindIndex(arg => arg.Equals("{", StringComparison.OrdinalIgnoreCase));
            if (openBrace < 0)
            {
                ShellOutput.Error("para: expected { body }");
                return 1;
            }

            int closeBrace = FindMatchingBrace(arguments, openBrace);
            if (closeBrace < 0)
            {
                ShellOutput.Error("para: missing closing brace");
                return 1;
            }

            int kadaIndex = arguments.FindIndex(arg => arg.Equals("kada", StringComparison.OrdinalIgnoreCase));
            if (kadaIndex < 0)
            {
                if (arguments.Count >= 2)
                {
                    string fallbackItemName = arguments[0];
                    string fallbackValuesToken = string.Join(" ", arguments.GetRange(1, openBrace - 1));
                    string fallbackBody = string.Join(" ", arguments.GetRange(openBrace + 1, closeBrace - openBrace - 1));
                    return RunLoop(fallbackItemName, fallbackValuesToken, fallbackBody);
                }

                ShellOutput.Error("para: expected 'kada' variable");
                return 1;
            }

            string loopItemName = arguments[kadaIndex + 1];
            int sourceIndex = -1;
            for (int i = kadaIndex + 2; i < openBrace; i++)
            {
                if (arguments[i].Equals("sa", StringComparison.OrdinalIgnoreCase) ||
                    arguments[i].Equals("in", StringComparison.OrdinalIgnoreCase))
                {
                    sourceIndex = i;
                    break;
                }
            }

            if (sourceIndex < 0)
            {
                ShellOutput.Error("para: expected 'sa' or 'in' before values");
                return 1;
            }

            string loopValuesToken = string.Join(" ", arguments.GetRange(sourceIndex + 1, openBrace - sourceIndex - 1));
            string loopBody = string.Join(" ", arguments.GetRange(openBrace + 1, closeBrace - openBrace - 1));
            return RunLoop(loopItemName, loopValuesToken, loopBody);
        }

        private static int RunLoop(string itemName, string valuesToken, string body)
        {
            List<string> values = ResolveItems(valuesToken);
            int exitCode = 0;

            foreach (string value in values)
            {
                string expanded = body.Replace("$" + itemName, value, StringComparison.OrdinalIgnoreCase);
                int result = Execute(expanded);
                if (result != 0)
                    exitCode = result;
            }

            return exitCode;
        }

        private static int HandleWhile(List<string> arguments, string rawInput)
        {
            if (arguments.Count < 2)
            {
                ShellOutput.Error("while: expected condition and block");
                return 1;
            }

            int openBrace = arguments.FindIndex(arg => arg.Equals("{", StringComparison.OrdinalIgnoreCase));
            if (openBrace < 0)
            {
                ShellOutput.Error("while: expected { body }");
                return 1;
            }

            int closeBrace = FindMatchingBrace(arguments, openBrace);
            if (closeBrace < 0)
            {
                ShellOutput.Error("while: missing closing brace");
                return 1;
            }

            string condition = string.Join(" ", arguments.GetRange(0, openBrace));
            string body = string.Join(" ", arguments.GetRange(openBrace + 1, closeBrace - openBrace - 1));
            int exitCode = 0;

            while (EvaluateCondition(condition))
            {
                int result = Execute(body);
                if (result != 0)
                    exitCode = result;
            }

            return exitCode;
        }

        private static List<string> ResolveItems(string valuesToken)
        {
            string trimmed = valuesToken.Trim();
            if (trimmed.Length == 0)
                return new List<string>();

            if (trimmed.Contains(',') || trimmed.Contains(';'))
                return trimmed.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            if (ShellState.TryGet(trimmed, out string value))
                return value.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

            return new List<string> { trimmed.Trim('"', '\'') };
        }

        private static bool EvaluateCondition(string condition)
        {
            string text = condition.Trim();
            if (string.IsNullOrWhiteSpace(text))
                return false;

            if (text.Equals("true", StringComparison.OrdinalIgnoreCase))
                return true;

            if (text.Equals("false", StringComparison.OrdinalIgnoreCase))
                return false;

            string[] comparisons = { "==", "!=", "=", "-eq", "-ne" };
            foreach (string op in comparisons)
            {
                int index = text.IndexOf(op, StringComparison.OrdinalIgnoreCase);
                if (index < 0)
                    continue;

                string left = text.Substring(0, index).Trim();
                string right = text.Substring(index + op.Length).Trim();
                left = Unquote(left);
                right = Unquote(right);

                if (ShellState.TryGet(left, out string leftValue))
                    left = leftValue;

                if (ShellState.TryGet(right, out string rightValue))
                    right = rightValue;

                return op switch
                {
                    "==" or "=" or "-eq" => string.Equals(left, right, StringComparison.OrdinalIgnoreCase),
                    "!=" or "-ne" => !string.Equals(left, right, StringComparison.OrdinalIgnoreCase),
                    _ => false
                };
            }

            if (text.StartsWith("$", StringComparison.Ordinal))
            {
                string variable = text.Substring(1).Trim();
                return ShellState.TryGet(variable, out string value) && !string.IsNullOrWhiteSpace(value);
            }

            return !string.IsNullOrWhiteSpace(Unquote(text));
        }

        private static string Unquote(string value)
        {
            value = value.Trim();
            if (value.Length >= 2 && ((value.StartsWith('"') && value.EndsWith('"')) || (value.StartsWith('\'') && value.EndsWith('\''))))
                return value.Substring(1, value.Length - 2);

            return value;
        }

        private static int FindMatchingBrace(List<string> arguments, int openIndex)
        {
            int depth = 0;
            for (int i = openIndex; i < arguments.Count; i++)
            {
                if (arguments[i].Equals("{", StringComparison.OrdinalIgnoreCase))
                    depth++;
                else if (arguments[i].Equals("}", StringComparison.OrdinalIgnoreCase))
                {
                    depth--;
                    if (depth == 0)
                        return i;
                }
            }

            return -1;
        }

        private static (int exitCode, string output) RunCaptured(string command)
        {
            lock (ExecutionLock)
            {
                StringWriter output = new StringWriter();
                TextWriter previous = Console.Out;

                try
                {
                    Console.SetOut(output);
                    int exitCode = Execute(command);
                    return (exitCode, output.ToString());
                }
                finally
                {
                    Console.SetOut(previous);
                }
            }
        }

        private static List<string> ResolveImportPaths(string pattern)
        {
            string expanded = ExpandVariables(pattern);
            string candidate = expanded.Trim();

            if (string.IsNullOrEmpty(candidate))
                return new List<string>();

            if (File.Exists(candidate))
                return new List<string> { candidate };

            if (Directory.Exists(candidate))
            {
                return Directory.EnumerateFiles(candidate, "*.ban", SearchOption.AllDirectories)
                    .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }

            string directory = Path.GetDirectoryName(candidate);
            string filePattern = Path.GetFileName(candidate);

            if (string.IsNullOrWhiteSpace(directory))
                directory = Directory.GetCurrentDirectory();

            if (!Directory.Exists(directory))
                return new List<string>();

            if (string.IsNullOrWhiteSpace(filePattern) || filePattern == "." || filePattern == "..")
                filePattern = "*.ban";

            if (!filePattern.Contains('*') && !filePattern.Contains('?'))
                filePattern = filePattern + ".ban";

            return Directory.EnumerateFiles(directory, filePattern, SearchOption.TopDirectoryOnly)
                .Where(path => path.EndsWith(".ban", StringComparison.OrdinalIgnoreCase) ||
                    path.EndsWith(".ps1", StringComparison.OrdinalIgnoreCase) ||
                    path.EndsWith(".txt", StringComparison.OrdinalIgnoreCase))
                .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static string ExpandVariables(string input)
        {
            string expanded = input;

            expanded = expanded.Replace("$?", ShellOutput.LastExitCode == 0 ? "True" : "False", StringComparison.OrdinalIgnoreCase);
            expanded = expanded.Replace("$LASTEXITCODE", ShellOutput.LastExitCode.ToString(), StringComparison.OrdinalIgnoreCase);

            return Regex.Replace(expanded, @"\$(env:)?([A-Za-z_][A-Za-z0-9_]*)", match =>
            {
                if (match.Groups[1].Success)
                    return Environment.GetEnvironmentVariable(match.Groups[2].Value) ?? "";

                return ShellState.TryGet(match.Groups[2].Value, out string value)
                    ? value
                    : match.Value;
            });
        }

        private static IEnumerable<(string command, string? operatorText)> SplitConditionals(string input)
        {
            int start = 0;
            char quote = '\0';

            for (int i = 0; i < input.Length - 1; i++)
            {
                if (input[i] == '\'' || input[i] == '"')
                {
                    quote = quote == '\0' ? input[i] : quote == input[i] ? '\0' : quote;
                    continue;
                }

                if (quote == '\0' && (input.Substring(i, 2) == "&&" || input.Substring(i, 2) == "||"))
                {
                    yield return (input.Substring(start, i - start), input.Substring(i, 2));
                    start = i + 2;
                    i++;
                }
            }

            yield return (input.Substring(start), null);
        }

        private static string[] SplitTopLevel(string input, char separator)
        {
            List<string> parts = new List<string>();
            int start = 0;
            int angleDepth = 0;
            char quote = '\0';

            for (int i = 0; i < input.Length; i++)
            {
                if (input[i] == '\'' || input[i] == '"')
                {
                    quote = quote == '\0' ? input[i] : quote == input[i] ? '\0' : quote;
                }
                else if (separator == '>' && quote == '\0' && input[i] == '<')
                {
                    angleDepth++;
                }
                else if (separator == '>' && quote == '\0' && input[i] == '>' && angleDepth > 0)
                {
                    angleDepth--;
                }
                else if (input[i] == separator && quote == '\0' && angleDepth == 0)
                {
                    parts.Add(input.Substring(start, i - start));
                    start = i + 1;
                }
            }

            parts.Add(input.Substring(start));
            return parts.ToArray();
        }

        private static (string command, string? redirect, bool append) ExtractRedirection(string input)
        {
            string[] appendParts = SplitTopLevel(input, '>');

            if (appendParts.Length > 1)
            {
                bool append = input.Contains(">>", StringComparison.Ordinal);
                string target = appendParts[appendParts.Length - 1].Trim();
                string command = input.Substring(0, input.LastIndexOf('>')).TrimEnd('>').Trim();
                return (command, target, append);
            }

            return (input, null, false);
        }

        private static List<string> Parse(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return new List<string>();

            List<string> parts = new List<string>();
            StringBuilder current = new StringBuilder();
            char quote = '\0';
            bool escaping = false;
            bool tokenStarted = false;

            foreach (char character in input)
            {
                if (escaping)
                {
                    current.Append(character);
                    escaping = false;
                    tokenStarted = true;
                    continue;
                }

                if (character == '\\')
                {
                    if (quote != '\0')
                    {
                        escaping = true;
                    }
                    else
                    {
                        current.Append(character);
                    }

                    tokenStarted = true;
                    continue;
                }

                if (character == '\'' || character == '"')
                {
                    if (quote == '\0')
                    {
                        quote = character;
                        tokenStarted = true;
                    }
                    else if (quote == character)
                    {
                        quote = '\0';
                    }
                    else
                    {
                        current.Append(character);
                    }

                    continue;
                }

                if (char.IsWhiteSpace(character) && quote == '\0')
                {
                    if (current.Length > 0 || tokenStarted)
                    {
                        parts.Add(current.ToString());
                        current.Clear();
                        tokenStarted = false;
                    }

                    continue;
                }

                current.Append(character);
                tokenStarted = true;
            }

            if (escaping)
            {
                current.Append('\\');
            }

            if (current.Length > 0 || tokenStarted)
            {
                parts.Add(current.ToString());
            }

            return parts;
        }
    }
}
