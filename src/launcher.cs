using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

// Assembly metadata for Windows PE verification
[assembly: AssemblyTitle("BATDOC")]
[assembly: AssemblyDescription("100% Grounded Windows Battery Intelligence Diagnostic")]
[assembly: AssemblyCompany("RootDeveloperDS")]
[assembly: AssemblyProduct("BATDOC")]
[assembly: AssemblyCopyright("Copyright (c) 2026 RootDeveloperDS")]
[assembly: AssemblyVersion("1.4.1.0")]
[assembly: AssemblyFileVersion("1.4.1.0")]
[assembly: ComVisible(false)]

namespace BatDoc
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                // 1. Interrogate battery hardware telemetry via Windows powercfg
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

                // 2. Load standalone template (prefers embedded resource, with optional local override)
                string templateContent = null;
                string localTemplate = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "batdoc-standalone.html");

                if (File.Exists(localTemplate))
                {
                    templateContent = File.ReadAllText(localTemplate, Encoding.UTF8);
                }
                else
                {
                    Assembly asm = typeof(Program).Assembly;
                    using (Stream stream = asm.GetManifestResourceStream("BatDoc.batdoc-standalone.html"))
                    {
                        if (stream != null)
                        {
                            using (StreamReader reader = new StreamReader(stream, Encoding.UTF8))
                            {
                                templateContent = reader.ReadToEnd();
                            }
                        }
                    }
                }

                if (string.IsNullOrEmpty(templateContent))
                {
                    MessageBox.Show(
                        "BATDOC embedded diagnostic template could not be loaded.",
                        "BATDOC Diagnostic",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // 3. Inject raw report as Base64 payload into template
                byte[] rawBytes = File.ReadAllBytes(rawReportPath);
                string base64Payload = Convert.ToBase64String(rawBytes);
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
