using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Defaultism
{
    public static class ShellState
    {
        private static readonly Dictionary<string, string> variables =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        private static readonly Dictionary<string, ShellFunction> functions =
            new Dictionary<string, ShellFunction>(StringComparer.OrdinalIgnoreCase);

        private static readonly Dictionary<int, ShellJob> jobs =
            new Dictionary<int, ShellJob>();
        private static int nextJobId;

        public static void Set(string name, string value)
        {
            if (!string.IsNullOrWhiteSpace(name))
                variables[name] = value;
        }

        public static bool TryGet(string name, out string value)
        {
            return variables.TryGetValue(name, out value!);
        }

        public static bool Remove(string name)
        {
            return variables.Remove(name);
        }

        public static IReadOnlyDictionary<string, string> Variables => variables;

        public static IReadOnlyDictionary<string, ShellFunction> Functions => functions;

        public static void DefineFunction(
            string name,
            IReadOnlyList<string> parameters,
            string body)
        {
            if (!string.IsNullOrWhiteSpace(name))
                functions[name] = new ShellFunction(name, parameters, body);
        }

        public static bool TryGetFunction(
            string name,
            out ShellFunction function)
        {
            return functions.TryGetValue(name, out function!);
        }

        public static string GetProfilePath()
        {
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Y",
                "profile.ban");
        }

        public static ShellJob StartJob(
            string command,
            Func<string, CancellationToken, (int exitCode, string output)> execute)
        {
            int id = ++nextJobId;
            CancellationTokenSource cancellation = new CancellationTokenSource();
            ShellJob job = new ShellJob(id, command, cancellation);

            Task task = Task.Run(() =>
            {
                try
                {
                    (int exitCode, string output) result = execute(command, cancellation.Token);
                    job.ExitCode = result.exitCode;
                    job.Output = result.output;
                }
                catch (Exception ex)
                {
                    job.ExitCode = 1;
                    job.Error = ex.Message;
                }
            }, cancellation.Token);

            job.Task = task;
            jobs[id] = job;
            return job;
        }

        public static IReadOnlyDictionary<int, ShellJob> Jobs => jobs;

        public static bool TryGetJob(int id, out ShellJob job)
        {
            return jobs.TryGetValue(id, out job!);
        }

        public static bool StopJob(int id)
        {
            if (!jobs.TryGetValue(id, out ShellJob? job) || job.Task.IsCompleted)
                return false;

            job.Cancellation.Cancel();
            return true;
        }

    }
}
