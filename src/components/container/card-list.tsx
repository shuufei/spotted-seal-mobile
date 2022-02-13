import { omit, orderBy } from 'lodash';
import { FlatList, View } from 'native-base';
import { FC, useMemo } from 'react';
import { Dimensions, ListRenderItemInfo } from 'react-native';
import { useSelector } from 'react-redux';
import { ALL_CARD_LIST } from '../../configs/all-card-list';
import { CardInfo, Category } from '../../domains/card';
import { selectors } from '../../store/card-list-filter-store';
import { Card } from '../presentation/card';

type FlatListItemData = CardInfo & {
  width: number;
  height: number;
  padding: number;
};

/**
 * TODO: memoize
 */
export const CardList: FC = () => {
  const columns = 4;
  const gap = 1.5;
  const windowWidth = Dimensions.get('window').width;
  const { cardWidth, cardHeight } = useMemo(() => {
    const nativeBaseSizeKey = 4; // NOTE: native baseのスペースの基準値
    const totalSpace = gap * nativeBaseSizeKey * (columns * 2);
    const cardWidth = (windowWidth - totalSpace) / 4;
    const cardHeight = cardWidth * 1.395;
    return {
      cardWidth,
      cardHeight,
    };
  }, [windowWidth]);

  const filteredColors = useSelector(selectors.colorsSelector);
  const filteredCardTypes = useSelector(selectors.cardTypesSelector);
  const filteredLvList = useSelector(selectors.lvListSelector);
  const filteredCategories = useSelector(selectors.categoriesSelector);
  const filteredIncludesParallel = useSelector(
    selectors.includesParallelSelector
  );

  const filteredCardList = useMemo(() => {
    return ALL_CARD_LIST.filter((card) => {
      const isColorMatch = !!card.colors.find((color) => {
        return filteredColors.includes(color);
      });
      const isCardTypeMatch = filteredCardTypes.includes(card.cardtype);
      const isLvMatch = card.lv && filteredLvList.includes(card.lv);
      const isCategoryMatch = filteredCategories.includes(
        card.category as Category
      );
      const isIncludesParallelMatch =
        card.parallel !== undefined ? filteredIncludesParallel : true;
      return (
        isColorMatch &&
        isCardTypeMatch &&
        isLvMatch &&
        isCategoryMatch &&
        isIncludesParallelMatch
      );
    });
  }, [
    filteredColors,
    filteredCardTypes,
    filteredLvList,
    filteredCategories,
    filteredIncludesParallel,
  ]);

  return (
    <View>
      <FlatList
        keyExtractor={(item) => `${item.no}-${item.parallel || 'regular'}`}
        data={orderBy(filteredCardList, ['cardtype', 'lv', 'color']).map(
          (d) => ({
            ...d,
            width: cardWidth,
            height: cardHeight,
            padding: gap,
          })
        )}
        renderItem={({ item }: ListRenderItemInfo<FlatListItemData>) => {
          return (
            <Card
              card={omit(item, ['width', 'height', 'padding'])}
              width={item.width}
              height={item.height}
              padding={item.padding}
            />
            /**
             * NOTE:
             * Bare workflowじゃないと利用できない
             * https://github.com/DylanVann/react-native-fast-image/issues/692
             * https://github.com/DylanVann/react-native-fast-image/issues/704
             * https://docs.expo.dev/introduction/managed-vs-bare/?redirected
             */
            // <FastImage
            //   style={{ width: item.width, height: item.height, margin: item.padding }}
            //   source={{
            //     uri: `${ENDPOINT}/BT01/${item.no}.png?${signedQueryStrings}`,
            //     priority: FastImage.priority.normal,
            //   }}
            //   resizeMode={FastImage.resizeMode.contain}
            // />
          );
        }}
        removeClippedSubviews={true}
        /**
         * FIXME: スクロール時の描画が安定したいないためgetItemLayoutを無効にする
         */
        // getItemLayout={(_, index) => ({
        //   length: cardHeight,
        //   offset: cardHeight * (index / columns),
        //   index,
        // })}
        numColumns={columns}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
      />
    </View>
  );
};
