import { partialRight, without } from "lodash";
import React, { PropTypes } from "react";
import AreaHelpers from "./helper-methods";
import {
  PropTypes as CustomPropTypes, Helpers, VictoryTransition, VictoryLabel, VictoryContainer,
  DefaultTransitions, Area, VictoryClipContainer, addEvents, VictoryTheme, Data, Domain
} from "victory-core";

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50,
  interpolation: "linear"
};

const animationWhitelist = ["data", "domain", "height", "padding", "style", "width"];

class VictoryArea extends React.Component {

  static propTypes = {
    animate: PropTypes.object,
    categories: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.shape({
        x: PropTypes.arrayOf(PropTypes.string), y: PropTypes.arrayOf(PropTypes.string)
      })
    ]),
    containerComponent: PropTypes.element,
    data: PropTypes.array,
    domainPadding: PropTypes.oneOfType([
      PropTypes.shape({
        x: PropTypes.oneOfType([ PropTypes.number, CustomPropTypes.domain ]),
        y: PropTypes.oneOfType([ PropTypes.number, CustomPropTypes.domain ])
      }),
      PropTypes.number
    ]),
    dataComponent: PropTypes.element,
    domain: PropTypes.oneOfType([
      CustomPropTypes.domain,
      PropTypes.shape({ x: CustomPropTypes.domain, y: CustomPropTypes.domain })
    ]),
    events: PropTypes.arrayOf(PropTypes.shape({
      target: PropTypes.oneOf(["data", "labels", "parent"]),
      eventKey: PropTypes.oneOfType([
        PropTypes.array,
        CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
        PropTypes.string
      ]),
      eventHandlers: PropTypes.object
    })),
    groupComponent: PropTypes.element,
    height: CustomPropTypes.nonNegative,
    interpolation: PropTypes.oneOf([
      "basis", "bundle", "cardinal", "catmullRom", "linear", "monotoneX",
      "monotoneY", "natural", "radial", "step", "stepAfter", "stepBefore"
    ]),
    Label: CustomPropTypes.deprecated(
      PropTypes.string,
      "Use `labels` instead for individual data labels"
    ),
    labels: PropTypes.oneOfType([ PropTypes.func, PropTypes.array ]),
    labelComponent: PropTypes.element,
    name: PropTypes.string,
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number, bottom: PropTypes.number,
        left: PropTypes.number, right: PropTypes.number
      })
    ]),
    samples: CustomPropTypes.nonNegative,
    scale: PropTypes.oneOfType([
      CustomPropTypes.scale,
      PropTypes.shape({ x: CustomPropTypes.scale, y: CustomPropTypes.scale })
    ]),
    sharedEvents: PropTypes.shape({
      events: PropTypes.array,
      getEventState: PropTypes.func
    }),
    sortKey: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    standalone: PropTypes.bool,
    style: PropTypes.shape({
      parent: PropTypes.object, data: PropTypes.object, labels: PropTypes.object
    }),
    theme: PropTypes.object,
    width: CustomPropTypes.nonNegative,
    x: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    y: PropTypes.oneOfType([
      PropTypes.func,
      CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  };

  static defaultProps = {
    dataComponent: <Area/>,
    labelComponent: <VictoryLabel/>,
    scale: "linear",
    samples: 50,
    standalone: true,
    containerComponent: <VictoryContainer />,
    groupComponent: <VictoryClipContainer/>,
    theme: VictoryTheme.grayscale
  };

  static displayName = "VictoryArea";
  static role = "area";
  static continuous = true;
  static defaultTransitions = DefaultTransitions.continuousTransitions();
  static getDomain = Domain.getDomainWithZero.bind(Domain);
  static getData = Data.getData.bind(Data);
  static getBaseProps = partialRight(AreaHelpers.getBaseProps.bind(AreaHelpers), fallbackProps);
  static expectedComponents = [
    "dataComponent", "labelComponent", "groupComponent", "containerComponent"
  ];


  renderData(props) {
    const { dataComponent, labelComponent, groupComponent } = props;
    const dataKeys = without(this.dataKeys, "all");
    const labelComponents = dataKeys.reduce((memo, key) => {
      const labelProps = this.getComponentProps(labelComponent, "labels", key);
      if (labelProps && labelProps.text !== undefined && labelProps.text !== null) {
        memo = memo.concat(React.cloneElement(labelComponent, labelProps));
      }
      return memo;
    }, []);
    const dataProps = this.getComponentProps(dataComponent, "data", "all");
    const children = [React.cloneElement(dataComponent, dataProps), ...labelComponents];
    return this.renderContainer(groupComponent, children);
  }

  renderContainer(component, children) {
    const isContainer = component.type && component.type.role === "container";
    const parentProps = isContainer ? this.getComponentProps(component, "parent", "parent") : {};
    return React.cloneElement(component, parentProps, children);
  }

  shouldAnimate() {
    return !!this.props.animate;
  }

  render() {
    const { role } = this.constructor;
    const props = Helpers.modifyProps(this.props, fallbackProps, role);

    if (this.shouldAnimate()) {
      return (
        <VictoryTransition animate={props.animate} animationWhitelist={animationWhitelist}>
          {React.createElement(this.constructor, props)}
        </VictoryTransition>
      );
    }
    const children = this.renderData(props);
    return this.renderContainer(props.containerComponent, children);
  }
}

export default addEvents(VictoryArea);
