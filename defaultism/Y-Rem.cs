using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Defaultism
{
    public static class ShellRemote
    {
        private static readonly object Sync = new object();
        private static readonly object OutputSync = new object();
        private static TcpListener? listener;
        private static string token = "";

        public static bool IsListening => listener != null;

        public static bool Start(int port, string sharedToken)
        {
            lock (Sync)
            {
                if (listener != null || port < 1 || port > 65535 || string.IsNullOrWhiteSpace(sharedToken))
                    return false;

                TcpListener server = new TcpListener(IPAddress.Loopback, port);
                server.Start();
                listener = server;
                token = sharedToken;
                _ = Task.Run(() => AcceptClients(server));
                return true;
            }
        }

        public static void Stop()
        {
            lock (Sync)
            {
                listener?.Stop();
                listener = null;
                token = "";
            }
        }

        public static string Connect(int port, string sharedToken, string command)
        {
            using TcpClient client = new TcpClient();
            client.Connect(IPAddress.Loopback, port);

            using NetworkStream stream = client.GetStream();
            using StreamReader reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true);
            using StreamWriter writer = new StreamWriter(stream, Encoding.UTF8, leaveOpen: true)
            {
                AutoFlush = true
            };

            writer.WriteLine(sharedToken);
            writer.WriteLine(command);
            return reader.ReadToEnd().TrimEnd('\r', '\n');
        }

        private static async Task AcceptClients(TcpListener server)
        {
            while (listener == server)
            {
                try
                {
                    TcpClient client = await server.AcceptTcpClientAsync();
                    _ = Task.Run(() => HandleClient(client));
                }
                catch (SocketException)
                {
                    break;
                }
                catch (ObjectDisposedException)
                {
                    break;
                }
            }
        }

        private static void HandleClient(TcpClient client)
        {
            using (client)
            using (NetworkStream stream = client.GetStream())
            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true))
            using (StreamWriter writer = new StreamWriter(stream, Encoding.UTF8, leaveOpen: true)
            {
                AutoFlush = true
            })
            {
                if (!IsLoopback(client))
                {
                    writer.WriteLine("remote: only loopback clients are allowed");
                    return;
                }

                string? receivedToken = reader.ReadLine();
                string? command = reader.ReadLine();

                if (!string.Equals(receivedToken, token, StringComparison.Ordinal))
                {
                    writer.WriteLine("remote: authentication failed");
                    return;
                }

                if (string.IsNullOrWhiteSpace(command))
                {
                    writer.WriteLine("remote: command is required");
                    return;
                }

                StringWriter output = new StringWriter();
                TextWriter previous = Console.Out;

                lock (OutputSync)
                {
                    try
                    {
                        Console.SetOut(output);
                        Com.Execute(command);
                    }
                    finally
                    {
                        Console.SetOut(previous);
                    }
                }

                writer.Write(output.ToString());
            }
        }

        private static bool IsLoopback(TcpClient client)
        {
            if (client.Client.RemoteEndPoint is not IPEndPoint endpoint)
                return false;

            return IPAddress.IsLoopback(endpoint.Address);
        }
    }
}
