import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
  Tailwind,
  Img,
} from "@react-email/components";


interface LoginEmailProps {
  ipAddress: string;
  timestamp: string;
  userAgent: string;
  userName: string;
}

const colors = {
    nandor: "#55625c",       // Dark green-gray
    sorrellBrown: "#cbac91", // Light brown
    gulfStream: "#83bab4",   // Teal
    easternBlue: "#1aa6b8",  // Bright blue
  };

export const LoginEmail: React.FC<Readonly<LoginEmailProps>> = ({
    ipAddress,
    timestamp,
    userAgent,
    userName,
  }) => (
        <Html>
          <Head />
          <Tailwind>
            <Body className="bg-gray-100 font-sans">
              <Container className="mx-auto my-[40px] bg-white p-[48px] rounded-[8px] shadow-sm max-w-[600px]">
                <Section>
                <Img
              src="https://s3.hogwarts.dev/assets/phishdirectory.jpeg"
              alt="Phish Directory Logo"
              width="120"
              height="auto"
              className="w-[120px] h-auto object-cover mx-auto mb-[24px]"
            />
                  <Heading className={`text-[24px] font-bold my-[24px]`} style={{ color: colors.nandor }}>
                    New Sign-in Detected
                  </Heading>
                  
                  <Text className="text-[16px] text-gray-700 mb-[24px]">
                    Hi {userName},
                  </Text>
                  
                  <Text className="text-[16px] text-gray-700 mb-[16px]">
                    We detected a <strong>new sign-in</strong> to your phish.directory account. If this was you, no action is needed.
                  </Text>
    
                  <Section className="p-[24px] rounded-[8px] my-[24px] border-l-[4px]" style={{ backgroundColor: `${colors.gulfStream}20`, borderLeftColor: colors.gulfStream }}>
                    <Text className="text-[16px] font-bold mb-[16px]" style={{ color: colors.nandor }}>
                      Sign-in Details:
                    </Text>
                    <Text className="text-[14px] text-gray-700 mb-[8px]">
                      <strong>Date & Time:</strong> {timestamp}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mb-[8px]">
                      <strong>IP Address:</strong> {ipAddress}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mb-[8px]">
                      <strong>Device/Browser:</strong> {userAgent}
                    </Text>
                    <Text className="text-[14px] text-gray-700 mb-[8px]">
                      <strong>Access Method:</strong> phish.directory API
                    </Text>
                  </Section>
    
                  <Section className="p-[24px] rounded-[8px] my-[24px] border-l-[4px]" style={{ backgroundColor: `${colors.sorrellBrown}20`, borderLeftColor: colors.sorrellBrown }}>
                    <Text className="text-[16px] font-bold mb-[8px]" style={{ color: colors.nandor }}>
                      Important Security Notice
                    </Text>
                    <Text className="text-[14px] text-gray-700">
                      If this wasn't you, please contact <a href="mailto:security@phish.directory" style={{ color: colors.easternBlue }}>security@phish.directory</a> immediately AND change your password.
                    </Text>
                  </Section>
    
                  <Button
                    className="py-[12px] px-[24px] rounded-[4px] font-bold no-underline text-center block box-border text-white"
                    href="mailto:security@phish.directory?subject=Unauthorized%20Account%20Access&body=I%20received%20a%20login%20notification%20that%20wasn't%20me.%20Please%20help%20secure%20my%20account.%0A%0ATimestamp:%20{timestamp}%0AIP%20Address:%20{ipAddress}%0ADevice:%20{userAgent}"
                    style={{ backgroundColor: colors.easternBlue }}
                  >
                    Report Unauthorized Access
                  </Button>
    
                  <Text className="text-[16px] text-gray-700 mt-[24px] mb-[24px]">
                    Thank you for helping keep your account secure,
                    <br />
                    The phish.directory Security Team
                  </Text>
                </Section>
    
                <Hr className="my-[24px]" style={{ borderColor: `${colors.sorrellBrown}40` }} />
                
                <Section>
                  <Text className="text-[12px] text-gray-500 m-0">
                    This is an automated security notification. If you need assistance, please contact security@phish.directory.
                  </Text>
                  <Text className="text-[12px] text-gray-500 mt-[8px] mb-[8px]">
                    © {new Date().getFullYear()} phish.directory. All rights reserved.
                  </Text>
                  {/* <Text className="text-[12px] text-gray-500 m-0">
                    123 Security Ave., Cyberspace, CS 12345
                  </Text> */}
                  {/* <Text className="text-[12px] mt-[16px]" style={{ color: colors.nandor }}>
                    <a href="https://phish.directory/unsubscribe" style={{ color: colors.nandor, textDecoration: "underline" }}>
                      Manage notification settings
                    </a>{" "}
                    •{" "}
                    <a href="https://phish.directory/privacy" style={{ color: colors.nandor, textDecoration: "underline" }}>
                      Privacy Policy
                    </a>
                  </Text> */}
                </Section>
              </Container>
            </Body>
          </Tailwind>
        </Html>
      );