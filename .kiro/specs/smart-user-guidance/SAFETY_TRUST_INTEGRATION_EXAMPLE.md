# Safety & Trust Guidance - Integration Examples

## Complete Integration Examples

### Example 1: Chat Screen with Contact Detection

```typescript
// app/chat/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, KeyboardAvoidingView } from 'react-native';
import { SafetyTrustGuidance } from '@/components/guidance';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [lastReceivedMessage, setLastReceivedMessage] = useState('');

  // Monitor incoming messages for contact info
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender_id !== user?.id) {
        setLastReceivedMessage(lastMsg.content);
      }
    }
  }, [messages, user]);

  const handleSend = async () => {
    if (!currentMessage.trim()) return;
    
    // Send message logic here
    await sendMessage(currentMessage);
    
    setCurrentMessage('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      {/* Safety Guidance - monitors both sent and received messages */}
      <SafetyTrustGuidance
        messageText={lastReceivedMessage || currentMessage}
        onContactInfoDetected={() => {
          console.log('Contact info detected - safety warning shown');
          // Optional: Track analytics
        }}
      />

      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={currentMessage}
          onChangeText={setCurrentMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}
```

---

### Example 2: Meeting Scheduler with Time-Based Safety

```typescript
// components/MeetingScheduler.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafetyTrustGuidance } from '@/components/guidance';

interface MeetingSchedulerProps {
  listingId: string;
  sellerId: string;
  onScheduled: (date: Date, location: string) => void;
}

export function MeetingScheduler({ listingId, sellerId, onScheduled }: MeetingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);

  // Determine meeting context based on selected time
  const getMeetingContext = (): 'daytime' | 'evening' | 'night' => {
    if (!selectedDate) return 'daytime';
    
    const hour = selectedDate.getHours();
    
    // Night: 8pm - 6am (20:00 - 06:00)
    if (hour >= 20 || hour < 6) {
      return 'night';
    }
    
    // Evening: 5pm - 8pm (17:00 - 20:00)
    if (hour >= 17) {
      return 'evening';
    }
    
    // Daytime: 6am - 5pm (06:00 - 17:00)
    return 'daytime';
  };

  // Show guidance when date and location are selected
  useEffect(() => {
    if (selectedDate && selectedLocation) {
      setShowGuidance(true);
    }
  }, [selectedDate, selectedLocation]);

  const handleConfirm = () => {
    if (selectedDate && selectedLocation) {
      onScheduled(selectedDate, selectedLocation);
    }
  };

  return (
    <View style={styles.container}>
      {/* Safety Guidance based on meeting time */}
      <SafetyTrustGuidance
        hasMeetingArrangement={showGuidance}
        meetingContext={getMeetingContext()}
      />

      <Text style={styles.title}>Schedule a Meeting</Text>

      <DateTimePicker
        value={selectedDate || new Date()}
        mode="datetime"
        onChange={(event, date) => setSelectedDate(date)}
        minimumDate={new Date()}
      />

      <TextInput
        placeholder="Meeting location (e.g., Starbucks, City Mall)"
        value={selectedLocation}
        onChangeText={setSelectedLocation}
        style={styles.input}
      />

      {/* Visual indicator of meeting safety level */}
      {selectedDate && (
        <View style={[
          styles.safetyIndicator,
          { backgroundColor: 
            getMeetingContext() === 'night' ? '#ff4444' :
            getMeetingContext() === 'evening' ? '#ffaa00' :
            '#44ff44'
          }
        ]}>
          <Text style={styles.safetyText}>
            {getMeetingContext() === 'night' ? '⚠️ High Risk Time' :
             getMeetingContext() === 'evening' ? '⚠️ Use Caution' :
             '✅ Safe Time'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirm}
        disabled={!selectedDate || !selectedLocation}
      >
        <Text style={styles.confirmText}>Confirm Meeting</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### Example 3: Transaction Complete with Rating Prompt

```typescript
// app/transaction-complete.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafetyTrustGuidance } from '@/components/guidance';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TransactionCompleteScreen() {
  const router = useRouter();
  const { transactionId } = useLocalSearchParams();
  const { user } = useAuth();
  const [isFirstTransaction, setIsFirstTransaction] = useState(false);

  useEffect(() => {
    checkIfFirstTransaction();
  }, []);

  const checkIfFirstTransaction = async () => {
    if (!user) return;

    // Query user's transaction count
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    if (!error && data) {
      setIsFirstTransaction(data.length === 1);
    }
  };

  const handleRateTransaction = () => {
    router.push(`/rate-transaction/${transactionId}`);
  };

  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* First Transaction Guidance */}
      <SafetyTrustGuidance
        isFirstTransaction={isFirstTransaction}
        onFirstTransactionComplete={handleRateTransaction}
      />

      <View style={styles.successCard}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Transaction Complete!</Text>
        <Text style={styles.message}>
          Your transaction has been marked as complete.
          {isFirstTransaction && ' This is your first transaction - congratulations!'}
        </Text>

        <TouchableOpacity
          style={styles.rateButton}
          onPress={handleRateTransaction}
        >
          <Text style={styles.rateButtonText}>Rate This Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleGoHome}
        >
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

---

### Example 4: Profile Screen with Low Rating Feedback

```typescript
// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafetyTrustGuidance } from '@/components/guidance';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>();
  const [showLowRatingGuidance, setShowLowRatingGuidance] = useState(false);
  const [recentRatings, setRecentRatings] = useState([]);

  useEffect(() => {
    loadUserRating();
  }, []);

  const loadUserRating = async () => {
    if (!user) return;

    // Get user's average rating
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && ratings && ratings.length > 0) {
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      setUserRating(avgRating);
      setRecentRatings(ratings);

      // Show guidance if recently received a low rating
      const latestRating = ratings[0].rating;
      if (latestRating < 3) {
        setShowLowRatingGuidance(true);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Low Rating Feedback */}
      <SafetyTrustGuidance
        userRating={userRating}
        showLowRatingGuidance={showLowRatingGuidance}
      />

      <View style={styles.header}>
        <Image source={{ uri: user?.avatar_url }} style={styles.avatar} />
        <Text style={styles.name}>{user?.full_name}</Text>
        
        {/* Rating Display */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingValue}>
            {userRating ? userRating.toFixed(1) : 'N/A'}
          </Text>
          <Text style={styles.ratingLabel}>⭐ Rating</Text>
          
          {userRating && userRating < 3 && (
            <TouchableOpacity
              style={styles.improvementButton}
              onPress={() => setShowLowRatingGuidance(true)}
            >
              <Text style={styles.improvementText}>
                💡 See Improvement Tips
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Ratings */}
      <View style={styles.ratingsSection}>
        <Text style={styles.sectionTitle}>Recent Ratings</Text>
        {recentRatings.map((rating, index) => (
          <RatingCard key={index} rating={rating} />
        ))}
      </View>

      {/* Profile Stats */}
      <View style={styles.statsSection}>
        <StatCard label="Listings" value={user?.listing_count || 0} />
        <StatCard label="Sales" value={user?.sales_count || 0} />
        <StatCard label="Reviews" value={recentRatings.length} />
      </View>
    </ScrollView>
  );
}
```

---

### Example 5: Report Screen with Confirmation

```typescript
// app/report-user.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafetyTrustGuidance } from '@/components/guidance';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportUserScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Suspicious behavior',
    'Scam attempt',
    'Inappropriate content',
    'Harassment',
    'Fake listing',
    'Other',
  ];

  const handleSubmitReport = async () => {
    if (!reportReason || !reportDetails.trim()) {
      alert('Please select a reason and provide details');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user?.id,
          reported_user_id: userId,
          reason: reportReason,
          details: reportDetails,
          status: 'pending',
        });

      if (error) throw error;

      setReportSubmitted(true);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAcknowledged = () => {
    // Navigate back to previous screen
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Report Confirmation Guidance */}
      <SafetyTrustGuidance
        reportSubmitted={reportSubmitted}
        onReportAcknowledged={handleReportAcknowledged}
      />

      <View style={styles.content}>
        <Text style={styles.title}>Report User</Text>
        <Text style={styles.subtitle}>
          Help us keep Marché.cd safe by reporting suspicious activity
        </Text>

        {/* Reason Selection */}
        <Text style={styles.label}>Reason for Report *</Text>
        <View style={styles.reasonsContainer}>
          {reportReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonButton,
                reportReason === reason && styles.reasonButtonSelected,
              ]}
              onPress={() => setReportReason(reason)}
            >
              <Text
                style={[
                  styles.reasonText,
                  reportReason === reason && styles.reasonTextSelected,
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Details Input */}
        <Text style={styles.label}>Additional Details *</Text>
        <TextInput
          style={styles.detailsInput}
          placeholder="Please provide specific details about the issue..."
          value={reportDetails}
          onChangeText={setReportDetails}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!reportReason || !reportDetails.trim() || isSubmitting) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitReport}
          disabled={!reportReason || !reportDetails.trim() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🛡️ Your report will be reviewed by our team within 24 hours.
            All reports are confidential.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
```

---

### Example 6: Combined Usage in Listing Detail

```typescript
// app/listing/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafetyTrustGuidance } from '@/components/guidance';
import { useAuth } from '@/contexts/AuthContext';

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);

  const handleContactSeller = () => {
    // Navigate to chat with safety guidance
    router.push(`/chat/${listing.seller_id}`);
  };

  const handleReportListing = async () => {
    // Submit report
    await submitReport(listing.id);
    setShowReportConfirmation(true);
  };

  const handleScheduleMeeting = () => {
    // Navigate to meeting scheduler
    router.push(`/schedule-meeting/${listing.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Report Confirmation */}
      <SafetyTrustGuidance
        reportSubmitted={showReportConfirmation}
        onReportAcknowledged={() => {
          setShowReportConfirmation(false);
          router.back();
        }}
      />

      {/* Listing Content */}
      <View style={styles.content}>
        <ImageGallery images={listing?.images} />
        
        <Text style={styles.title}>{listing?.title}</Text>
        <Text style={styles.price}>{listing?.price} FC</Text>
        
        {/* Seller Info with Safety Reminder */}
        <View style={styles.sellerCard}>
          <Image source={{ uri: seller?.avatar_url }} style={styles.sellerAvatar} />
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{seller?.full_name}</Text>
            <Text style={styles.sellerRating}>
              ⭐ {seller?.rating?.toFixed(1)} ({seller?.review_count} reviews)
            </Text>
          </View>
          
          {/* Safety reminder for low-rated sellers */}
          {seller?.rating && seller.rating < 3 && (
            <View style={styles.cautionBadge}>
              <Text style={styles.cautionText}>⚠️ Use Caution</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContactSeller}
        >
          <Text style={styles.contactButtonText}>Contact Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.meetingButton}
          onPress={handleScheduleMeeting}
        >
          <Text style={styles.meetingButtonText}>Schedule Meeting</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportListing}
        >
          <Text style={styles.reportButtonText}>🚩 Report Listing</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

---

## Best Practices

### 1. Prop Management
```typescript
// ✅ Good: Pass only relevant props
<SafetyTrustGuidance messageText={message} />

// ❌ Bad: Pass all props even when not needed
<SafetyTrustGuidance
  messageText={message}
  hasMeetingArrangement={false}
  isFirstTransaction={false}
  userRating={undefined}
  reportSubmitted={false}
/>
```

### 2. State Management
```typescript
// ✅ Good: Track state locally
const [showGuidance, setShowGuidance] = useState(false);

useEffect(() => {
  if (condition) {
    setShowGuidance(true);
  }
}, [condition]);

// ❌ Bad: Trigger directly without state
<SafetyTrustGuidance hasMeetingArrangement={condition} />
```

### 3. Callback Handling
```typescript
// ✅ Good: Provide meaningful callbacks
<SafetyTrustGuidance
  onFirstTransactionComplete={() => {
    trackAnalytics('first_transaction_complete');
    router.push('/rate');
  }}
/>

// ❌ Bad: Empty or missing callbacks
<SafetyTrustGuidance
  onFirstTransactionComplete={() => {}}
/>
```

### 4. Context Detection
```typescript
// ✅ Good: Calculate context dynamically
const getMeetingContext = () => {
  const hour = selectedDate.getHours();
  if (hour >= 20 || hour < 6) return 'night';
  if (hour >= 17) return 'evening';
  return 'daytime';
};

// ❌ Bad: Hardcode context
<SafetyTrustGuidance meetingContext="daytime" />
```

---

## Common Patterns

### Pattern 1: Conditional Rendering
```typescript
{shouldShowSafetyGuidance && (
  <SafetyTrustGuidance {...props} />
)}
```

### Pattern 2: Multiple Triggers
```typescript
<SafetyTrustGuidance
  messageText={chatMessage}
  hasMeetingArrangement={hasMeeting}
  meetingContext={getMeetingContext()}
/>
```

### Pattern 3: Analytics Integration
```typescript
<SafetyTrustGuidance
  onContactInfoDetected={() => {
    analytics.track('safety_warning_shown', {
      type: 'contact_info',
      screen: 'chat',
    });
  }}
/>
```

---

## Troubleshooting

### Issue: Modal not appearing
**Solution**: Check guidance level settings
```typescript
const { state } = useGuidance();
console.log('Guidance level:', state.settings.guidanceLevel);
// Should be 'full' or 'minimal', not 'off'
```

### Issue: Detection not working
**Solution**: Verify message text is being passed
```typescript
console.log('Message text:', messageText);
// Should contain actual message content
```

### Issue: State not persisting
**Solution**: Ensure GuidanceProvider is in app root
```typescript
// app/_layout.tsx
<GuidanceProvider>
  <App />
</GuidanceProvider>
```

---

## Testing Integration

```typescript
// __tests__/SafetyTrustGuidance.integration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SafetyTrustGuidance } from '@/components/guidance';
import { GuidanceProvider } from '@/contexts/GuidanceContext';

describe('SafetyTrustGuidance Integration', () => {
  it('shows contact info warning in chat', async () => {
    const { getByText } = render(
      <GuidanceProvider>
        <SafetyTrustGuidance messageText="+243 812 345 678" />
      </GuidanceProvider>
    );

    await waitFor(() => {
      expect(getByText(/Rappel de sécurité/)).toBeTruthy();
    });
  });
});
```
