import { useLayout } from '@aragon/ui';

import { TimeInterval } from 'components/TimeInterval/TimeInterval';
import { CircularProgressStatus } from 'utils/types';
import { ANCircularProgressWithCaption } from 'components/CircularProgress/ANCircularProgressWithCaption';

type Props = {
  delayInSeconds: number;
  isLoading: boolean;
};

const ExecutionDelay: React.FC<Props> = ({ delayInSeconds, isLoading }) => {
  const { layoutName } = useLayout();
  return isLoading ? (
    <ANCircularProgressWithCaption
      caption="Fetching Execution delay"
      state={CircularProgressStatus.InProgress}
    />
  ) : (
    <TimeInterval
      title="Execution delay"
      subtitle="Amount of time any transaction in your DAO will be available to be disputed by your members before being executed."
      placeholder={'Amount'}
      inputName="delayInputValue"
      dropdownName="delaySelectedIndex"
      resultName="daoConfig.executionDelay"
      shouldUnregister={false}
      timeInSeconds={delayInSeconds}
      inputContainerStyles={layoutName !== 'small' && { width: 'auto', flexWrap: 'nowrap' }}
    />
  );
};

export default ExecutionDelay;
