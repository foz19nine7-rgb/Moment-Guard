# Moment Guard — حارس اللحظة

- **Live Demo:** https://project-6f932b.lovable.app
- **Repository:** https://github.com/foz19nine7-rgb/Moment-Guard

## Problem & Solution
Scam messages, fake delivery alerts, bank impersonation, and suspicious links exploit urgency and fear, making it difficult for users to judge risk quickly—especially on mobile screens.

**Moment Guard** provides an immediate, mobile-first Arabic (RTL) anti-fraud assistant that:
- Analyzes pasted messages, links, and uploaded screenshots to extract text and evaluate risk signals.
- Displays clear risk classification, practical protection steps, and reduces false positives on legitimate official notifications that lack suspicious links or credential/payment requests.
- Lets users save a trusted contact locally and trigger a quick WhatsApp alert message when in doubt.

## Technical Reasoning
- **Mobile-First Arabic (RTL) UX:** Built for fast, clear reading on phones during high-pressure moments.
- **Signal & Context Analysis + Official Notification Guard:** Evaluates urgency, verification/OTP requests, and suspicious links while separating routine official updates.
- **Local Trusted Contact Storage:** Storing the trusted contact number locally on the device protects privacy while enabling instant one-tap WhatsApp escalation.
- **Quick Test Presets:** Built-in sample scenarios allow rapid testing and live hackathon demos.

## Trade-offs & Future Improvements
- **Included in MVP:** Message/link/screenshot inspection flow, Arabic RTL interface, risk result cards and actionable guidance, official-notice handling, local trusted contact saving, and WhatsApp alert action.
- **Left Out / Future Work:** Deeper automated link/domain reputation intelligence, expanded multilingual coverage, and broader community/family protection workflows with additional development time.

## Build & Run Instructions
1. Clone the repository and switch to the `master` branch:
   ```bash
   git clone [https://github.com/foz19nine7-rgb/Moment-Guard.git](https://github.com/foz19nine7-rgb/Moment-Guard.git)
   cd Moment-Guard
   git checkout master
