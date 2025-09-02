import { TitleBar } from "@shopify/app-bridge-react";
import {
  BlockStack,
  Button,
  Card,
  Checkbox,
  Form,
  FormLayout,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  RadioButton,
} from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  console.log(admin);
  console.log(session);

  return null;
};

export default function SettingsPage() {
  // 7 days name to make an object
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // days array are processed here to make an object
  const initialStoreHours = days.reduce((acc, day) => {
    acc[day] = {
      isOpen: false,
      openTime: "09:00",
      closeTime: "17:00",
    };
    return acc;
  }, {});

  // state to store the store hours
  const [storeHours, setStoreHours] = useState(initialStoreHours);

  // state to store time format preference (12 or 24 hour)
  const [timeFormat, setTimeFormat] = useState("12"); // '12' or '24'

  // Generate time options (every 30 minutes)
  const timeOptions = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      let displayLabel;
      if (timeFormat === "12") {
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour < 12 ? "AM" : "PM";
        const displayMinute = minute.toString().padStart(2, "0");
        displayLabel = `${displayHour}:${displayMinute} ${period}`;
      } else {
        displayLabel = timeString;
      }

      timeOptions.push({
        label: displayLabel,
        value: timeString, // Always store in 24-hour format
      });
    }
  }

  const handleDayToggle = (day) => {
    setStoreHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const handleTimeChange = (day, timeType, value) => {
    setStoreHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeType]: value,
      },
    }));
  };

  const renderDayRow = (day) => (
    <InlineStack key={day} gap="500" wrap={true} blockAlign="center">
      <div style={{ minWidth: "80px" }}>
        <Text as="p" fontWeight="bold">
          {day.charAt(0).toUpperCase() + day.slice(1)}
        </Text>
      </div>

      <Checkbox
        label="Open"
        checked={storeHours[day].isOpen}
        onChange={() => handleDayToggle(day)}
      />

      <InlineStack gap="500">
        <div style={{ minWidth: "120px" }}>
          <Select
            label="Opening: "
            disabled={!storeHours[day].isOpen}
            options={timeOptions}
            value={storeHours[day].openTime}
            onChange={(value) => handleTimeChange(day, "openTime", value)}
          />
        </div>

        <div style={{ minWidth: "120px" }}>
          <Select
            label="Closing: "
            disabled={!storeHours[day].isOpen}
            options={timeOptions}
            value={storeHours[day].closeTime}
            onChange={(value) => handleTimeChange(day, "closeTime", value)}
          />
        </div>
      </InlineStack>
    </InlineStack>
  );

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Time Format Preference
                  </Text>
                  <InlineStack gap="400">
                    <RadioButton
                      label="12-hour format (AM/PM)"
                      checked={timeFormat === "12"}
                      id="format12"
                      name="timeFormat"
                      onChange={() => setTimeFormat("12")}
                    />
                    <RadioButton
                      label="24-hour format"
                      checked={timeFormat === "24"}
                      id="format24"
                      name="timeFormat"
                      onChange={() => setTimeFormat("24")}
                    />
                  </InlineStack>
                </BlockStack>
              </Card>

              <Form onSubmit={() => console.log(storeHours)}>
                <FormLayout>
                  <BlockStack gap="500">
                    {days.map((day) => renderDayRow(day))}
                  </BlockStack>

                  <Button submit variant="primary">
                    Save Hours
                  </Button>
                </FormLayout>
              </Form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
