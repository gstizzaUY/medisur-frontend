import CardFour from '../../components/CardFour.tsx';
import CardOne from '../../components/CardOne.tsx';
import CardThree from '../../components/CardThree.tsx';
import CardTwo from '../../components/CardTwo.tsx';
import CardFive from '../../components/CardFive.tsx';
import CardSix from '../../components/CardSix.tsx';
import ChartOne from '../../components/ChartOne.tsx';
import CardSeven from '../../components/CardSeven.tsx';
import CardEight from '../../components/CardEight.tsx';
import CardNine from '../../components/CardNine.tsx';

const ECommerce = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        { /* titulo */}
        <CardOne />
        <CardTwo />
        <CardThree />
        <CardSix />
        <CardFour />
        <CardFive />
        <CardSeven />
        <CardEight />
        <CardNine />
      </div>

      <div className="mt-4 grid-cols-1 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        {/* <ChartTwo /> */}
        {/* <ChartThree /> */}
        {/* <MapOne /> */}
        <div className="col-span-12 xl:col-span-8 mt-6">
          {/* <TableOne /> */}
        </div>
        {/* <ChatCard /> */}
      </div>
    </>
  );
};

export default ECommerce;
