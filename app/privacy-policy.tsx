import { pp as styles } from "@/styles/privacy-policy.styles";
import Head from "expo-router/head";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

const isWeb = Platform.OS === "web";

const TABLE_ROWS = [
  ["Creating and managing your account", "Performance of a contract"],
  ["Authentication and account security", "Performance of a contract / Legitimate interest"],
  ["Sending transactional emails and in-app notifications", "Performance of a contract"],
  ["Sending marketing emails and promotional push notifications", "Consent"],
  ["Improving our Services through analytics", "Legitimate interest"],
  ["Customer support", "Performance of a contract"],
  ["Complying with legal obligations", "Legal obligation"],
];

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function SectionDivider() {
  return <View style={styles.divider} />;
}

export default function PrivacyPolicyPage() {
  const router = useRouter();

  if (!isWeb) return null;

  return (
    <View style={[styles.container, styles.containerWeb]}>
      <Head>
        <title>Privacy Policy – Money Garden</title>
        <meta name="description" content="Privacy Policy for Money Garden app" />
      </Head>

      <View style={styles.stickyNav}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.72 }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backBtnText}>← Back to Home</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.openAppBtn, pressed && { opacity: 0.82 }]}
          onPress={() => router.push("/landing")}
        >
          <Text style={styles.openAppBtnText}>Open App →</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerMeta}>
            Effective Date: May 11, 2026 · Last Updated: May 11, 2026
          </Text>
        </View>

        <View style={styles.contentArea}>
          <View style={styles.contentInner}>

            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.paragraph}>
              Welcome to <Text style={styles.bold}>Money Garden</Text>! We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it when you use our mobile application (iOS and Android) and web platform (collectively, the "Services").
            </Text>
            <Text style={styles.paragraph}>
              Please read this policy carefully. If you disagree with its terms, please discontinue use of our Services.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>2. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions or concerns about this policy, you may contact us at:
            </Text>
            <Bullet><Text style={styles.bold}>Email:</Text> help@getmoneygarden.com</Bullet>
            <Bullet><Text style={styles.bold}>Website:</Text> https://www.getmoneygarden.com</Bullet>
            <SectionDivider />

            <Text style={styles.sectionTitle}>3. Information We Collect</Text>
            <Text style={styles.subsectionTitle}>3.1 Information You Provide to Us</Text>
            <Bullet><Text style={styles.bold}>Name</Text> – used to personalize your account experience.</Bullet>
            <Bullet><Text style={styles.bold}>Email address</Text> – used for account registration, login, support communication, and sending you updates or promotional messages.</Bullet>
            <Text style={styles.subsectionTitle}>3.2 Information Collected Automatically</Text>
            <Text style={styles.paragraph}>
              When you use our Services, we automatically collect certain technical data, including:
            </Text>
            <Bullet><Text style={styles.bold}>Usage data</Text> – features accessed, pages visited, time spent in the app.</Bullet>
            <Bullet><Text style={styles.bold}>Device information</Text> – device type, operating system, app version, unique device identifiers.</Bullet>
            <Bullet><Text style={styles.bold}>Log data</Text> – IP address, browser type (for the web platform), timestamps, and crash reports.</Bullet>
            <Text style={styles.subsectionTitle}>3.3 Information We Do NOT Collect</Text>
            <Text style={styles.paragraph}>
              We do not collect financial or banking information (card numbers, bank accounts), precise geolocation data, biometric data, or any other special categories of personal data as defined under GDPR.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>4. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use your personal data only for the purposes described below, each tied to a lawful basis under GDPR:
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Purpose</Text>
                </View>
                <View style={styles.tableHeaderCell}>
                  <Text style={styles.tableHeaderText}>Legal Basis</Text>
                </View>
              </View>
              {TABLE_ROWS.map(([purpose, basis], i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{purpose}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{basis}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.paragraph}>
              You may withdraw your consent to marketing communications at any time (see Section 9).
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>5. How We Share Your Information</Text>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>We do not sell, rent, or share your personal data with any third parties</Text>, including advertisers, data brokers, or analytics providers.
            </Text>
            <Text style={styles.paragraph}>
              Your data may only be disclosed in the following limited circumstances:
            </Text>
            <Bullet><Text style={styles.bold}>Legal requirements</Text> – if we are required by law, court order, or governmental authority to disclose your information.</Bullet>
            <Bullet><Text style={styles.bold}>Protection of rights</Text> – to protect the safety, rights, or property of Money Garden, our users, or the public.</Bullet>
            <SectionDivider />

            <Text style={styles.sectionTitle}>6. Data Retention</Text>
            <Text style={styles.paragraph}>
              We retain your personal data for as long as your account is active or as needed to provide you with the Services. If you delete your account, we will delete or anonymize your personal data within <Text style={styles.bold}>30 days</Text>, unless we are required to retain it longer by law.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>7. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encrypted data storage, secure HTTPS connections, and access controls.
            </Text>
            <Text style={styles.paragraph}>
              However, no method of transmission over the internet or electronic storage is 100% secure. We encourage you to use a strong, unique password for your account.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our Services are not directed to individuals under the age of <Text style={styles.bold}>16</Text>. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>9. Your Rights</Text>
            <Text style={styles.subsectionTitle}>9.1 Rights Under GDPR (European Users)</Text>
            <Text style={styles.paragraph}>
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have the following rights:
            </Text>
            <Bullet><Text style={styles.bold}>Right of access</Text> – request a copy of the personal data we hold about you.</Bullet>
            <Bullet><Text style={styles.bold}>Right to rectification</Text> – request correction of inaccurate or incomplete data.</Bullet>
            <Bullet><Text style={styles.bold}>Right to erasure</Text> – request deletion of your personal data ("right to be forgotten").</Bullet>
            <Bullet><Text style={styles.bold}>Right to restriction</Text> – request that we limit the processing of your data.</Bullet>
            <Bullet><Text style={styles.bold}>Right to data portability</Text> – receive your data in a structured, machine-readable format.</Bullet>
            <Bullet><Text style={styles.bold}>Right to object</Text> – object to processing based on legitimate interest or for direct marketing.</Bullet>
            <Bullet><Text style={styles.bold}>Right to withdraw consent</Text> – withdraw consent at any time for any processing based on consent (e.g. marketing emails).</Bullet>
            <Text style={styles.paragraph}>
              To exercise any of these rights, contact us at <Text style={styles.bold}>privacy@moneygarden.app</Text>. We will respond within <Text style={styles.bold}>30 days</Text>.
            </Text>
            <Text style={styles.paragraph}>
              You also have the right to lodge a complaint with your local data protection authority.
            </Text>
            <Text style={styles.subsectionTitle}>9.2 Rights Under CCPA (California Users)</Text>
            <Text style={styles.paragraph}>
              If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
            </Text>
            <Bullet><Text style={styles.bold}>Right to know</Text> – request disclosure of the categories and specific pieces of personal information we have collected about you.</Bullet>
            <Bullet><Text style={styles.bold}>Right to delete</Text> – request deletion of your personal information, subject to certain exceptions.</Bullet>
            <Bullet><Text style={styles.bold}>Right to opt-out of sale</Text> – we do not sell your personal information, so this right does not apply.</Bullet>
            <Bullet><Text style={styles.bold}>Right to non-discrimination</Text> – we will not discriminate against you for exercising any of your CCPA rights.</Bullet>
            <Text style={styles.paragraph}>
              To submit a CCPA request, contact us at <Text style={styles.bold}>privacy@moneygarden.app</Text> or use the account deletion feature in the app.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>10. Marketing Communications & Notifications</Text>
            <Text style={styles.paragraph}>We may send you:</Text>
            <Bullet><Text style={styles.bold}>Transactional emails</Text> – account confirmations, security alerts, and service updates. These cannot be opted out of while your account is active.</Bullet>
            <Bullet><Text style={styles.bold}>Marketing emails</Text> – tips, offers, and product news. You can unsubscribe at any time by clicking the "Unsubscribe" link in any email.</Bullet>
            <Bullet><Text style={styles.bold}>Push notifications</Text> – app updates and personalized reminders. You can disable these at any time through your device settings (iOS: Settings → Notifications; Android: Settings → Apps → Money Garden → Notifications).</Bullet>
            <SectionDivider />

            <Text style={styles.sectionTitle}>11. Account Deletion</Text>
            <Text style={styles.paragraph}>
              You can delete your account at any time directly from the app settings under <Text style={styles.bold}>Account → Delete Account</Text>. Upon deletion:
            </Text>
            <Bullet>Your name and email address will be permanently removed from our systems within <Text style={styles.bold}>30 days</Text>.</Bullet>
            <Bullet>Automatically collected technical data will be anonymized.</Bullet>
            <Bullet>You will no longer receive any communications from us.</Bullet>
            <SectionDivider />

            <Text style={styles.sectionTitle}>12. International Data Transfers</Text>
            <Text style={styles.paragraph}>
              If you are located in the EEA or UK, please note that your data may be transferred to and processed in countries outside the EEA. In such cases, we ensure that appropriate safeguards are in place (such as Standard Contractual Clauses approved by the European Commission) to protect your data.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>13. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. When we do, we will revise the "Last Updated" date at the top of this page and notify you via email or an in-app notification if the changes are material.
            </Text>
            <Text style={styles.paragraph}>
              We encourage you to review this policy periodically to stay informed about how we protect your information.
            </Text>
            <SectionDivider />

            <Text style={styles.sectionTitle}>14. Governing Law</Text>
            <Text style={styles.paragraph}>
              This Privacy Policy is governed by applicable data protection laws, including the General Data Protection Regulation (GDPR) (EU) 2016/679 and the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.100 et seq.
            </Text>

          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>© 2026 Money Garden. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
