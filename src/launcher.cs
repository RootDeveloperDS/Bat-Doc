using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Windows.Forms;

namespace BatDoc
{
    static class Program
    {
        private const string StandaloneUrl = "https://raw.githubusercontent.com/RootDeveloperDS/Bat-Doc/master/batdoc-standalone.html";

        [STAThread]
        static void Main()
        {
            try
            {
                // 1. Interrogate battery telemetry via Windows powercfg
                string tempDir = Path.GetTempPath();
                string rawReportPath = Path.Combine(tempDir, "batdoc_raw.html");

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powercfg.exe";
                psi.Arguments = "/batteryreport /output \"" + rawReportPath + "\"";
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                using (Process proc = Process.Start(psi))
                {
                    if (proc != null)
                    {
                        proc.WaitForExit(10000);
                    }
                }

                if (!File.Exists(rawReportPath))
                {
                    MessageBox.Show(
                        "Could not generate Windows battery diagnostic.\n\nPlease verify that your computer has an active battery subsystem.",
                        "BATDOC Diagnostic",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return;
                }

                // 2. Resolve template path (local folder first, then temp cache)
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string templatePath = Path.Combine(appDir, "batdoc-standalone.html");

                if (!File.Exists(templatePath))
                {
                    templatePath = Path.Combine(appDir, "index.html");
                }

                if (!File.Exists(templatePath))
                {
                    string tempTemplate = Path.Combine(tempDir, "batdoc-standalone.html");
                    if (!File.Exists(tempTemplate))
                    {
                        try
                        {
                            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
                            using (WebClient client = new WebClient())
                            {
                                client.DownloadFile(StandaloneUrl, tempTemplate);
                            }
                        }
                        catch
                        {
                            // Network failure handled below if template missing
                        }
                    }

                    if (File.Exists(tempTemplate))
                    {
                        templatePath = tempTemplate;
                    }
                }

                if (!File.Exists(templatePath))
                {
                    MessageBox.Show(
                        "BATDOC standalone template could not be located.\n\nPlease ensure batdoc-standalone.html is in the same folder as batdoc.exe.",
                        "BATDOC Diagnostic",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // 3. Inject raw report as Base64 payload
                byte[] rawBytes = File.ReadAllBytes(rawReportPath);
                string base64Payload = Convert.ToBase64String(rawBytes);
                string templateContent = File.ReadAllText(templatePath, Encoding.UTF8);
                string finalHtml = templateContent.Replace("__RAW_REPORT_BASE64_PAYLOAD__", base64Payload);

                // 4. Resolve real Desktop path (OneDrive-aware)
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                if (string.IsNullOrEmpty(desktopPath) || !Directory.Exists(desktopPath))
                {
                    desktopPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Desktop");
                }

                string outputPath = Path.Combine(desktopPath, "BatDoc-Report.html");
                File.WriteAllText(outputPath, finalHtml, Encoding.UTF8);

                // If user's profile desktop is separate from OneDrive desktop, also save a copy there
                string profileDesktop = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Desktop");
                if (Directory.Exists(profileDesktop) && !string.Equals(desktopPath, profileDesktop, StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        File.Copy(outputPath, Path.Combine(profileDesktop, "BatDoc-Report.html"), true);
                    }
                    catch
                    {
                        // Non-critical mirror copy
                    }
                }

                // 5. Cleanup temp raw file
                try
                {
                    if (File.Exists(rawReportPath)) File.Delete(rawReportPath);
                }
                catch { }

                // 6. Launch generated report in default browser
                ProcessStartInfo launchPsi = new ProcessStartInfo(outputPath);
                launchPsi.UseShellExecute = true;
                Process.Start(launchPsi);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error executing BATDOC diagnostic: " + ex.Message,
                    "BATDOC Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
