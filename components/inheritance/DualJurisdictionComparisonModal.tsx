import React from 'react';
import { InheritanceCalculation } from '../../services/inheritanceEngine';
import Modal from '../ui/Modal';
import { DualJurisdictionSideComparison } from './DualJurisdictionSideComparison';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sunniCalc: InheritanceCalculation | null;
    jafariCalc: InheritanceCalculation | null;
}

export const DualJurisdictionComparisonModal: React.FC<Props> = ({
    isOpen,
    onClose,
    sunniCalc,
    jafariCalc
}) => {
    if (!sunniCalc || !jafariCalc) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="المحاكاة القضائية المزدوجة: مقارنة التوزيع السني والجعفري (تظليل الفروق الجوهرية بالذهبي)"
            size="xl"
        >
            <DualJurisdictionSideComparison
                sunniCalc={sunniCalc}
                jafariCalc={jafariCalc}
                onClose={onClose}
            />
        </Modal>
    );
};

