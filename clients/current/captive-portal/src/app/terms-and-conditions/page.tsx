"use client";

import { useTheme } from "@/components/theme-provider";
import { Navbar } from "@/components/home-page/head";
import AdSection from "@/components/ad-section";

export default function WelcomePage() {
  const { theme } = useTheme();

  // Remove all refernces of Wifi/Wi-Fi/Public Wifi/Hotspot etc
  const clientName = theme.name.replace(/Wi-Fi|WiFi|Public Wifi|Hotspot|Public/gi, "");

  return (
    <div style={{ background: theme.brandPrimary }} className="flex items-center justify-between flex-col max-w-md w-full min-h-[95vh]">
      <Navbar />

      {/* Welcome Text */}
      <div className="flex flex-col items-center mt-8 mb-6 w-full">
        <h1 className="text-3xl font-semibold text-center" style={{ color: theme.textPrimary }}>
          Wi-Fi Terms of Service -
          <br />
          {clientName}
        </h1>
      </div>


      {/* Main Card Section */}
      <div className="bg-white rounded-t-3xl pt-6 pb-6 px-6 min-h-[50vh] w-full overflow-y-auto">

        {/* General */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">General</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>The Wi-Fi service is an internet access service provided by {clientName} which allows visitors and guests to access the internet through a wireless access point ("Hotspot") using Wi-Fi (the "Service").</p>
            <p>These Terms of Service set out the conditions governing the use of the Service.</p>
            <p>By accessing or using the Service, you agree to comply with these Terms of Service. If you do not agree to these terms, you must not access or use the Service.</p>
            <p>You are solely responsible for all activity conducted using your device while connected to the Service.</p>
            <p>For the purposes of these Terms, "you" or "user" refers to the individual accessing the Service and any person authorised by you to use the Service through your device.</p>
            <p>{clientName} reserves the right to update or modify these Terms of Service at any time.</p>
          </div>
        </section>

        {/* Access to the Service */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Access to the Service</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>To access the Wi-Fi Service, users may be required to provide certain information including:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Name</li>
              <li>Mobile number</li>
              <li>Acceptance of these Terms of Service</li>
            </ul>
            <p>By submitting this information and accessing the Service, you consent to the collection and use of your information in accordance with applicable privacy laws and {clientName} policies. Personal information collected during access to the Service will be processed in accordance with the Protection of Personal Information Act (POPIA) and {clientName}'s Privacy Policy.</p>
          </div>
        </section>

        {/* Acceptable Use Policy */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Acceptable Use Policy</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>Users of the Service agree not to use the network for unlawful or harmful activities, including but not limited to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Accessing, transmitting, or distributing illegal or offensive content</li>
              <li>Harassment, abuse, or threatening behaviour</li>
              <li>Spamming or sending unsolicited communications</li>
              <li>Interfering with the operation of the network or other users</li>
              <li>Attempting to gain unauthorized access to systems or networks</li>
              <li>Distributing malware, viruses, or harmful software</li>
              <li>Infringing on intellectual property rights</li>
              <li>Conducting fraudulent activities</li>
            </ul>
            <p className="mt-3">Users may not:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the Service for illegal purposes</li>
              <li>Resell, share, or distribute the Service for commercial purposes</li>
              <li>Operate servers or host services over the network</li>
              <li>Engage in excessive bandwidth consumption that may negatively impact other users</li>
            </ul>
            <p className="mt-3">{clientName} reserves the right to restrict, suspend, or terminate access to any user who violates these conditions.</p>
            <p>{clientName} may cooperate with law enforcement authorities and legal processes where required by law, including providing connection records where legally requested.</p>
          </div>
        </section>

        {/* Session Limits and Network Management */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Session Limits and Network Management</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>To ensure fair access for all visitors, the Service may include limitations such as:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Session time limits</li>
              <li>Bandwidth management</li>
              <li>Automatic disconnection after periods of inactivity</li>
              <li>Device restrictions</li>
            </ul>
            <p className="mt-3">{clientName} reserves the right to filter, block, or restrict access to certain websites, protocols, or types of content in order to maintain network performance, comply with legal obligations, or protect users.</p>
            <p>{clientName} may log network activity such as device identifiers, IP addresses, connection times, and bandwidth usage for operational, security, and legal compliance purposes.</p>
            <p>{clientName} reserves the right to prioritise network traffic or restrict usage in order to maintain fair access for all users.</p>
            <p className="mt-3">Users may be disconnected if:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>The connection to the Hotspot is lost</li>
              <li>The device moves out of range</li>
              <li>The device remains inactive for an extended period</li>
              <li>The session time limit is reached</li>
            </ul>
          </div>
        </section>

        {/* Service Availability */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Service Availability</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>The Wi-Fi Service is provided as a convenience to visitors and is available only where Hotspot infrastructure exists.</p>
            <p>{clientName} does not guarantee uninterrupted or error-free access to the Service and shall not be held responsible for:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Service interruptions</li>
              <li>Network downtime</li>
              <li>Connectivity issues</li>
              <li>Loss of data or communications</li>
            </ul>
            <p className="mt-3">The Service must not be relied upon for emergency communications.</p>
          </div>
        </section>

        {/* Security and Privacy */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Security and Privacy</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>Wireless networks carry inherent security risks.</p>
            <p>Users acknowledge that:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>The network may not be secure</li>
              <li>Communications may be intercepted by third parties</li>
              <li>Users are responsible for securing their own devices</li>
            </ul>
            <p className="mt-3">{clientName} shall not be responsible for:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Loss of personal data</li>
              <li>Device damage or corruption</li>
              <li>Theft or unauthorized access to devices</li>
              <li>Viruses or malware obtained while using the Service</li>
            </ul>
            <p className="mt-3">Users are responsible for ensuring their devices are adequately protected.</p>
            <p>Minors using the Service should be supervised by a responsible adult.</p>
          </div>
        </section>

        {/* User Responsibility */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">User Responsibility</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>You acknowledge that internet use carries risks and that any activity conducted through your connection is your responsibility.</p>
            <p>{clientName} reserves the right to monitor network usage where required to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Maintain network performance</li>
              <li>Investigate misuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </section>

        {/* IP Address Allocation */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">IP Address Allocation</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>Any IP address assigned to your device while connected to the Service remains the property of {clientName} and may change at any time without notice.</p>
            <p>{clientName} shall not be liable for any issues resulting from changes in IP addressing.</p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Limitation of Liability</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>The Wi-Fi Service is provided "as is" and "as available" without any warranties or guarantees.</p>
            <p>To the fullest extent permitted by law, {clientName} and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Service.</p>
          </div>
        </section>

        {/* Indemnity */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Indemnity</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>By using the Service, you agree to indemnify and hold harmless {clientName}, its employees, agents, and affiliates against any claims, damages, or expenses arising from:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Your use of the Service</li>
              <li>Violation of these Terms of Service</li>
              <li>Illegal or unauthorized activity conducted using your device</li>
            </ul>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Governing Law</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>These Terms of Service shall be governed by and interpreted in accordance with the laws of the Republic of South Africa.</p>
          </div>
        </section>

        {/* Acceptance of Terms */}
        <section className="mb-6">
          <h2 className="text-gray-800 text-xl font-semibold mb-3">Acceptance of Terms</h2>
          <div className="text-gray-600 text-sm space-y-3">
            <p>By accessing or using the Wi-Fi Service, you confirm that you have read, understood, and agreed to these Terms of Service.</p>
          </div>
        </section>

      </div>

      {/* <AdSection /> */}
    </div>
  );
}
