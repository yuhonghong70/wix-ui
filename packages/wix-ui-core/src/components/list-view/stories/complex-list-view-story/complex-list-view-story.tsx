import * as React from 'react';
import {ListViewComposable, ListViewItemsView} from '../../list-view-composable';
import ItemStyle from './complex-list-view-story-item.st.css';
import RCDevSelectionListPanelButtonStyle from './complex-list-view-story-button.st.css';
import RCDevSelectionListPanelStyle from './complex-list-view-story.st.css';
import SelectionTypeItemStyle from './complex-list-view-story-horizontal-item.st.css'
import * as ListViewDataSource from '../../list-view-data-source';
import {
    DefaultTypeAheadStrategy, DisabledTypeAheadStrategy, ListViewDefaultState,
    ListViewItemId,
    ListViewRenderItemProps,
    ListViewSelectionType,
    ListViewState,
    NavigationOrientation,
    TypeAheadNavigationType
} from '../../list-view-types';
import {ListViewStateController} from '../../list-view-state-controller';
import {ListView} from '../../list-view';
import {ListViewNavigationInputBehaviour} from '../../list-view-navigation-input-behaviour';

export class ComplexListViewStory extends React.Component
{
    render () {
        return (
            <div>
                <RCDevSelectionListViewBasic
                    className={RCDevSelectionListPanelStyle.section}
                />
            </div>
        );
    }
}

interface RCDevSelectionListViewBasicState
{
    listViewState: ListViewState,
    selectionTypeListViewState: ListViewState,
    recommendedProductsCount: number,
    selectionType: ListViewSelectionType,
    useTypeAhead: boolean,
    allProductsCount: number,
}

interface SelectionTypeInfo {
    title: string,
    selectionType: ListViewSelectionType,
}

const selectionTypes = [
    {
        selectionType: ListViewSelectionType.Multiple,
        title: 'Multiple'
    },
    {
        selectionType: ListViewSelectionType.Single,
        title: 'Single'
    },
    {
        selectionType: ListViewSelectionType.None,
        title: 'None'
    }
];

const dataSource = ListViewDataSource.createDataSource(selectionTypes, {
    idFunction: item => item.selectionType,
    typeAheadTextFunction: item => item.title,
    isSelectable: () => true,
});

class RCDevSelectionListViewBasic extends React.Component<any, RCDevSelectionListViewBasicState>
{

    private selectionList = React.createRef<ListViewComposable>();
    private selectionTypeListView = React.createRef<ListView<SelectionTypeInfo>>();

    private fetchMoreButtonAll = ListViewDataSource.createNavigatablePrimitiveValuesDataSource(['FetchMoreButtonAll']);
    private fetchMoreButtonRecommended = ListViewDataSource.createNavigatablePrimitiveValuesDataSource(['FetchMoreButtonRecommended']);


    constructor (props: any) {
        super(props);

        this.state = {
            allProductsCount: 6,
            recommendedProductsCount: 4,
            listViewState: ListViewDefaultState,
            selectionTypeListViewState: ListViewDefaultState,
            useTypeAhead: true,
            selectionType: ListViewSelectionType.Multiple,
        };
    }

    render () {

        const {
            listViewState,
            selectionTypeListViewState,
            allProductsCount,
            recommendedProductsCount,
            useTypeAhead,
            selectionType,
        } = this.state;

        const {
            currentNavigatableItemId: currentSelectionTypeItemId,
        } = selectionTypeListViewState;

        const otherProducts = ListViewDataSource.createSelectablePrimitiveValuesDataSource(
            arrayGenerate(allProductsCount, i => 'Product ' + (i + 1)));

        const recommendedProducts = ListViewDataSource.createSelectablePrimitiveValuesDataSource(
            arrayGenerate(recommendedProductsCount, i => 'Recommended Product ' + (i + 1)));

        return (
            <div
                {...this.props}
            >
                <h1>Selection List Complex</h1>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}
                >
                    <div
                        style={{
                            marginRight: 20,
                            paddingRight: 20,
                            borderRight: '1px solid #aaa'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={useTypeAhead}
                            onChange={event => {
                                this.setState({
                                    useTypeAhead: (event.target as any).checked
                                })
                            }}
                        />
                        Use Type Ahead
                    </div>
                    <ListView
                        ref={this.selectionTypeListView}
                        listViewState={{
                            ...selectionTypeListViewState,
                            selectedIds:[selectionType]
                        }}
                        children={dataSource}
                        onChange={updatedState => {

                            const {
                                selectedIds: selectionTypesArr
                            } = updatedState;

                            const selectedSelectionType = selectionTypesArr[0] as ListViewSelectionType;
                            this.setState({
                                selectionType: selectedSelectionType,
                                listViewState: {
                                    ...listViewState,
                                    selectedIds: [],
                                },
                                selectionTypeListViewState: {
                                    ...selectionTypeListViewState,
                                    currentNavigatableItemId: updatedState.currentNavigatableItemId
                                },
                            });
                        }}
                        orientation={NavigationOrientation.Horizontal}
                        selectionType={ListViewSelectionType.Single}
                        renderItem={SelectionTypeViewItem}
                    />

                </div>
                <ListViewNavigationInputBehaviour
                    listViewSelector={() => this.selectionList}
                    isTypeAheadNavigationEnabled={useTypeAhead}
                >
                    <input
                        type="text"
                        style={{
                            height: 24,
                            padding: '0 10px',
                            width: '100%',
                            marginBottom: 20,
                            boxSizing: 'border-box'
                        }}
                    />
                </ListViewNavigationInputBehaviour>
                <ListViewComposable
                    ref={this.selectionList}
                    listViewState={listViewState}
                    className={RCDevSelectionListPanelStyle.selectionList}
                    isCyclic
                    dataSourcesArray={[
                        recommendedProducts,
                        this.fetchMoreButtonRecommended,
                        otherProducts,
                        this.fetchMoreButtonAll,
                    ]}
                    typeAheadStrategy={useTypeAhead ? DefaultTypeAheadStrategy : DisabledTypeAheadStrategy}
                    orientation={NavigationOrientation.Vertical}
                    tagName="div"
                    selectionType={selectionType}
                    onChange={updatedListViewState => {
                        this.setState({
                            listViewState: updatedListViewState,
                        })
                    }}
                >
                    <h2>Recommended Products</h2>
                    <ListViewItemsView
                        dataSource={recommendedProducts}
                        contextArg={{
                            selectionType
                        }}
                        contextArgEqualityComparer={contextArgComparer}
                        renderItem={renderProps => {
                            return (
                                <TextualItemView
                                    text={renderProps.dataItem}
                                    {...renderProps}
                                />
                            );
                        } }
                    />
                    <ListViewItemsView
                        dataSource={this.fetchMoreButtonRecommended}
                        renderItem={props => {

                            const {
                                isCurrent,
                                listViewItemRoot
                            } = props;

                            return (
                                <div
                                    {...listViewItemRoot()}
                                    {...RCDevSelectionListPanelButtonStyle('root', {current: isCurrent})}
                                    children="Fetch More"
                                    onClick={() => {
                                        this.fetchMoreRecommendedProducts();
                                    }}
                                    onKeyDown={(event: React.KeyboardEvent<Element>) => {

                                        if (event.key === 'Enter')
                                        {
                                            this.fetchMoreRecommendedProducts();
                                        }
                                    }}
                                />
                            )
                        }}
                    />
                    <div
                        className={RCDevSelectionListPanelStyle.separator}
                    />
                    <h2>All Products</h2>
                    <ListViewItemsView
                        dataSource={otherProducts}
                        contextArg={{
                            selectionType
                        }}
                        contextArgEqualityComparer={contextArgComparer}
                        renderItem={renderProps => {
                            return (
                                <TextualItemView
                                    text={renderProps.dataItem}
                                    {...renderProps}
                                />
                            );
                        }}
                    />
                    <ListViewItemsView
                        dataSource={this.fetchMoreButtonAll}
                        renderItem={props => {

                            const {
                                isCurrent,
                                listViewItemRoot
                            } = props;

                            return (
                                <div
                                    {...listViewItemRoot()}
                                    {...RCDevSelectionListPanelButtonStyle('root', {current: isCurrent})}
                                    children="Fetch More"
                                    onClick={() => {
                                        this.fetchMoreToAllProducts();
                                    }}
                                    onKeyDown={(event: React.KeyboardEvent<Element>) => {

                                        if (event.key === 'Enter')
                                        {
                                            this.fetchMoreToAllProducts();
                                        }
                                    }}
                                />
                            )
                        }}
                    />

                </ListViewComposable>
            </div>
        )
    }

    private fetchMoreToAllProducts () {
        this.setState({
            allProductsCount: this.state.allProductsCount + 3
        })
    }

    private fetchMoreRecommendedProducts () {
        this.setState({
            recommendedProductsCount: this.state.recommendedProductsCount + 3
        })
    }
}

interface RCDevSelectionListPanelState extends ListViewState
{
    filterItems: boolean,
    useTypeAhead: boolean,
    typeAheadValue: string
}

type TextualItemViewProps = {
    text: string
} & ListViewRenderItemProps<any, {selectionType: ListViewSelectionType}>


interface ItemButtonInfo {
    title: string,
    isSingle?: boolean,
    isForNoneSelectable?: boolean,
    action: (itemId: ListViewItemId, stateController: ListViewStateController) => void
}

const itemButtonsInfoArr: ItemButtonInfo[] = [
    {
        title: 'Select',
        isSingle: true,
        action: (itemId, stateController) => {
            stateController
                .selectItem(itemId)
                .moveToItem(itemId);
        }
    },
    {
        title: 'AddToSelection',
        action: (itemId, stateController) => {
            stateController
                .addItemToSelection(itemId)
                .moveToItem(itemId);
        }
    },
    {
        title: 'RemoveFromSelection',
        isSingle: true,
        action: (itemId, stateController) => {
            stateController
                .removeItemFromSelection(itemId)
                .moveToItem(itemId);
        }
    },
    {
        title: 'ToggleSelection',
        isSingle: true,
        action: (itemId, stateController) => {
            stateController
                .toggleItemSelection(itemId)
                .moveToItem(itemId);
        }
    },
    {
        title: 'SelectRange',
        action: (itemId, stateController) => {
            stateController
                .selectItemsInRange(stateController.getSelectionStartId(), itemId)
                .moveToItem(itemId);
        }
    },
    {
        title: 'ToggleDisable',
        isForNoneSelectable: true,
        action: (itemId, stateController) => {
            let isDisabled = stateController.isDisabled(itemId);
            stateController.toggleItemDisabled(itemId);

            if (isDisabled)
            {
                stateController.moveToItem(itemId);
            }
        }
    },
];

const TextualItemView: React.SFC<TextualItemViewProps> =props => {

    const {
        isSelected,
        isCurrent,
        text,
        listViewItemRoot,
        innerFocusableItem,
        updateState,
        dataItemId,
        triggerInteractiveSelection,
        contextArg: {
            selectionType
        }
    } = props;

    return (
        <div
            style={{
                paddingLeft: 50
            }}
        >
            <div
                {...listViewItemRoot()}
                {...ItemStyle('root', {selected: isSelected, current: isCurrent})}
                onClick={triggerInteractiveSelection}
            >
                <div
                    className={ItemStyle.innerText}
                >
                    {text}
                </div>
                {
                    itemButtonsInfoArr.filter(item => {
                        if(selectionType === ListViewSelectionType.Multiple){
                            return true;
                        }
                        else if(selectionType === ListViewSelectionType.Single){
                            return !!item.isSingle || !!item.isForNoneSelectable;
                        }
                        else if(selectionType ===ListViewSelectionType.None){
                            return !!item.isForNoneSelectable;
                        }
                    }).map(selectionInfo => {
                        return (
                            <button
                                key={selectionInfo.title}
                                className={ItemStyle.innerButton}
                                children={selectionInfo.title}
                                onClick={event => {
                                    event.stopPropagation();

                                    updateState(stateController => {
                                        selectionInfo.action(dataItemId, stateController);
                                    });
                                }}
                                {...innerFocusableItem()}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
};

const SelectionTypeViewItem: React.SFC<ListViewRenderItemProps<SelectionTypeInfo,null>> = renderProps => {

    const {
        isSelected,
        triggerInteractiveSelection,
        listViewItemRoot,
        dataItem
    } = renderProps;

    return (
        <div
            {...listViewItemRoot()}
            {...SelectionTypeItemStyle('root', {selected: isSelected})}
            onClick={triggerInteractiveSelection}
        >
            {dataItem.title}
        </div>
    )

};


export function arrayGenerate<T> (count: number, generator: (index: number) => T) : Array<T> {

    const result = [];

    for (let i = 0; i < count; i++)
    {
        result.push(generator(i));
    }

    return result;
}

function contextArgComparer(contextArg1, contextArg2){
    return contextArg1.selectionType === contextArg2.selectionType;
}