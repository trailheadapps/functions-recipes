package com.salesforce.functions.recipes;

import java.util.List;

public class Invocations {
    private String lastInvocationId;
    private String lastInvocationTime;
    private List<String> invocations;

    public void setLastInvocationId(String lastInvocationId) {
        this.lastInvocationId = lastInvocationId;
    }

    public void setLastInvocationTime(String lastInvocationTime) {
        this.lastInvocationTime = lastInvocationTime;
    }

    public void setInvocations(List<String> invocations) {
        this.invocations = invocations;
    }

    public String getLastInvocationId() {
        return this.lastInvocationId;
    }

    public String getLastInvocationTime() {
        return this.lastInvocationTime;
    }

    public List<String> getInvocations() {
        return this.invocations;
    }
}
