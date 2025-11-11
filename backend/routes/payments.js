const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PaymentProcessor = require('../utils/payment-processor');
const PayoutDistributor = require('../utils/payout-distributor');

// Payment processing endpoint
router.post('/process', [
    body('courseId').isInt({ min: 1 }),
    body('method').isIn(['eft', 'fnb', 'payfast', 'payshap', 'stripe', 'bitcoin', 'ethereum', 'usdt']),
    body('amount').isFloat({ min: 0 }),
    body('currency').isLength({ min: 3, max: 3 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment data',
                errors: errors.array() 
            });
        }

        const { courseId, method, amount, currency } = req.body;
        
        // Process payment
        const paymentResult = await PaymentProcessor.process({
            courseId,
            method,
            amount,
            currency,
            userId: req.user?.id, // From auth middleware
            ipAddress: req.ip
        });

        if (paymentResult.success) {
            // Distribute payout according to business rules
            await PayoutDistributor.distribute(paymentResult.amount, paymentResult.id);
            
            res.json({
                success: true,
                paymentId: paymentResult.id,
                downloadId: paymentResult.downloadId,
                message: 'Payment processed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentResult.message
            });
        }
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during payment processing'
        });
    }
});

// Get payment methods
router.get('/methods', async (req, res) => {
    try {
        const methods = await PaymentProcessor.getAvailableMethods();
        res.json({
            success: true,
            methods
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment methods'
        });
    }
});

// Verify payment status
router.get('/:paymentId/status', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const status = await PaymentProcessor.getStatus(paymentId);
        
        res.json({
            success: true,
            status
        });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment status'
        });
    }
});

// Crypto payment webhook
router.post('/webhook/crypto', async (req, res) => {
    try {
        const { paymentId, transactionHash, confirmations } = req.body;
        
        // Verify crypto payment
        const verified = await PaymentProcessor.verifyCryptoPayment(
            paymentId, 
            transactionHash, 
            confirmations
        );

        if (verified) {
            // Update payment status and grant course access
            await PaymentProcessor.completePayment(paymentId);
            
            res.json({ success: true, message: 'Payment verified' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Crypto webhook error:', error);
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});

// EFT payment confirmation
router.post('/confirm-eft', [
    body('paymentId').isLength({ min: 10 }),
    body('proofImage').isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid confirmation data',
                errors: errors.array() 
            });
        }

        const { paymentId, proofImage } = req.body;
        
        // Process EFT confirmation
        const result = await PaymentProcessor.confirmEFTPayment(paymentId, proofImage);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'EFT payment confirmation received. Access will be granted once verified.' 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: result.message 
            });
        }
    } catch (error) {
        console.error('EFT confirmation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process EFT confirmation' 
        });
    }
});

// Get currency exchange rates
router.get('/currency/rates', async (req, res) => {
    try {
        const rates = await PaymentProcessor.getExchangeRates();
        res.json({
            success: true,
            rates,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exchange rates'
        });
    }
});

module.exports = router;
