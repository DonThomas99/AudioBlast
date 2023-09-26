function updateOrderStatus(orderId) {
    try {
        let statusCounts = [];
        const orderData = User.findOne({ _id: orderId });

        orderData.products.forEach((pdt) => {
            let eachStatusCount = {
                status: pdt.status,
                count: 1,
            };

            let existingStatusIndex = statusCounts.findIndex(
                (item) => item.status === pdt.status
            );

            if (existingStatusIndex !== -1) {
                // Increment the count of an existing status
                statusCounts[existingStatusIndex].count += 1;
            } else {
                statusCounts.push(eachStatusCount);
            }
        });

        if (statusCounts.length === 1) {
            orderData.status = statusCounts[0].status;
            orderData.save();
            return;
        }

        let isOrderConfirmedExists = false;
        let isShippedExists = false;
        let isOutForDeliveryExists = false;
        let isDeliveredExists = false;
        let cancelledByUserCount;
        let cancelledByAdminCount;
        let returnApprovalCount;
        let returnedCount;

        statusCounts.forEach((item) => {
            if (item.status === 'Order Confirmed') {
                isOrderConfirmedExists = true;
            }

            if (item.status === 'Shipped') {
                isShippedExists = true;
            }

            if (item.status === 'Out For Delivery') {
                isOutForDeliveryExists = true;
            }

            if (item.status === 'Delivered') {
                isDeliveredExists = true;
            }

            if (item.status === 'Cancelled') {
                cancelledByUserCount = item.count;
            }

            if (item.status === 'Cancelled By Admin') {
                cancelledByAdminCount = item.count;
            }

            if (item.status === 'Pending Return Approval') {
                returnApprovalCount = item.count;
            }

            if (item.status === 'Returned') {
                returnedCount = item.count;
            }
        });

        if (isOrderConfirmedExists) {
            orderData.status = 'Order Confirmed';
            orderData.save();
            return;
        }

        if (isShippedExists) {
            orderData.status = 'Shipped';
            orderData.save();
            return;
        }

        if (isOutForDeliveryExists) {
            orderData.status = 'Out For Delivery';
            orderData.save();
            return;
        }

        if (isDeliveredExists) {
            orderData.status = 'Delivered';
            orderData.save();
            return;
        }

        let cancelledCount = 0;

        if (cancelledByUserCount) {
            cancelledCount += cancelledByUserCount;
        }

        if (cancelledByAdminCount) {
            cancelledCount += cancelledByAdminCount;
        }

        if (
            cancelledByUserCount === orderData.products.length ||
            cancelledCount === orderData.products.length
        ) {
            orderData.status = 'Cancelled';
            orderData.save();
            return;
        }

        if (cancelledByAdminCount === orderData.products.length) {
            orderData.status = 'Cancelled By Admin';
            orderData.save();
            return;
        }

        if (
            cancelledCount + returnApprovalCount + returnedCount ===
            orderData.products.length
        ) {
            orderData.status = 'Pending Return Approval';
            orderData.save();
            return;
        }

        if (cancelledCount + returnedCount === orderData.products.length) {
            orderData.status = 'Returned';
            orderData.save();
            return;
        }
    } catch (error) {
        // Handle errors here or rethrow the error if needed
        console.error('Error updating order status:', error);
    }
}
