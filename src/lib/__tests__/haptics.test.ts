import * as Haptics from 'expo-haptics';

import { errorFeedback, successFeedback, tapFeedback } from '../haptics';

jest.mock('expo-haptics');

describe('haptics', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('tapFeedback triggers a light impact', () => {
    tapFeedback();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('successFeedback triggers a success notification', () => {
    successFeedback();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
  });

  it('errorFeedback triggers an error notification', () => {
    errorFeedback();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
  });
});
