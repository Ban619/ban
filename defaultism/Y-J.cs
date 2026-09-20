using System;
using System.Threading;
using System.Threading.Tasks;

namespace Defaultism
{
    public sealed class ShellJob
    {
        internal ShellJob(int id, string command, CancellationTokenSource cancellation)
        {
            Id = id;
            Command = command;
            Cancellation = cancellation;
        }

        public int Id { get; }
        public string Command { get; }
        public Task Task { get; internal set; } = Task.CompletedTask;
        internal CancellationTokenSource Cancellation { get; }
        public string Output { get; internal set; } = "";
        public int ExitCode { get; internal set; }
        public string? Error { get; internal set; }
    }
}
